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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    /** FR-AUTH-001: 회원가입 */
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

        // UID 중복 시 재시도
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

    /** FR-AUTH-002: 로그인 */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
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

    /** FR-AUTH-003: 로그아웃 */
    public void logout(String uid) {
        redisTemplate.delete("session:" + uid);
    }

    /** FR-AUTH-004: 내 정보 조회 (내부 id 미노출) */
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

    private void saveSession(String uid, String token) {
        redisTemplate.opsForValue().set(
                "session:" + uid, token, Duration.ofHours(24));
    }
}