package com.backend.service;

import com.backend.dto.*;
import com.backend.entity.User;
import com.backend.repository.UserRepository;
import com.backend.security.CustomUserDetails;
import com.backend.security.JwtUtil;
import com.backend.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalStateException("이메일은 필수입니다.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalStateException("비밀번호는 필수입니다.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("이미 사용 중인 이메일입니다.");
        }

        String uid;
        do {
            uid = IdGenerator.generateUserUid();
        } while (userRepository.findByUid(uid).isPresent());

        User user = User.builder()
                .uid(uid)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role("USER")
                .build();

        userRepository.save(user);

        String token = jwtUtil.generateToken(uid);
        saveSession(uid, token);

        return AuthResponse.builder()
                .token(token)
                .uid(uid)
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalStateException("이메일은 필수입니다.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalStateException("비밀번호는 필수입니다.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        String token = jwtUtil.generateToken(user.getUid());
        saveSession(user.getUid(), token);

        return AuthResponse.builder()
                .token(token)
                .uid(user.getUid())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    public void logout(String uid) {
        redisTemplate.delete("session:" + uid);
    }

    @Transactional(readOnly = true)
    public UserResponse getMe(CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return UserResponse.builder()
                .uid(user.getUid())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, String> findIdByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("이메일은 필수입니다.");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 계정을 찾을 수 없습니다."));
        return Map.of("email", user.getEmail(), "name", user.getName());
    }

    @Transactional
    public Map<String, String> findPwByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("이메일은 필수입니다.");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 계정을 찾을 수 없습니다."));

        String tempPassword = UUID.randomUUID().toString().substring(0, 8);
        user.setPasswordHash(passwordEncoder.encode(tempPassword));

        return Map.of("password", tempPassword);
    }

    /** 현재 비밀번호 검증만 (DB 변경 없음) */
    @Transactional(readOnly = true)
    public void verifyPassword(CustomUserDetails userDetails, String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalStateException("비밀번호를 입력해주세요.");
        }
        User user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalStateException("현재 비밀번호가 일치하지 않습니다.");
        }
    }

    /** 비밀번호 변경 */
    @Transactional
    public void changePassword(CustomUserDetails userDetails, String currentPassword, String newPassword) {
        if (currentPassword == null || currentPassword.isBlank()) {
            throw new IllegalStateException("현재 비밀번호를 입력해주세요.");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalStateException("새 비밀번호를 입력해주세요.");
        }
        if (newPassword.length() < 6) {
            throw new IllegalStateException("새 비밀번호는 6자 이상이어야 합니다.");
        }

        User user = userRepository.findById(userDetails.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalStateException("현재 비밀번호가 일치하지 않습니다.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
    }

    private void saveSession(String uid, String token) {
        redisTemplate.opsForValue().set(
                "session:" + uid, token, Duration.ofHours(24));
    }
}