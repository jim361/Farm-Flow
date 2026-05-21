package com.backend.controller;

import com.backend.dto.AuthResponse;
import com.backend.dto.LoginRequest;
import com.backend.dto.SignupRequest;
import com.backend.dto.UserResponse;
import com.backend.security.CustomUserDetails;
import com.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "FR-AUTH: 인증/계정",
        description = "회원가입 · 로그인 · 로그아웃 · 내 정보 조회. 내부 id 미노출 정책 적용.")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "회원가입", description = "이메일·비밀번호·이름 입력 후 가입. JWT 즉시 발급.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "가입 성공 + JWT 반환"),
            @ApiResponse(responseCode = "400", description = "필수값 누락 또는 이메일 중복")
    })
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @Operation(summary = "로그인 / JWT 발급",
            description = "이메일+비밀번호 검증 후 JWT 반환. Redis session:{uid} 저장 (TTL 24h).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공 + JWT 반환"),
            @ApiResponse(responseCode = "404", description = "이메일 또는 비밀번호 불일치")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "로그아웃",
            description = "Redis session:{uid} 삭제. 이후 해당 토큰은 인증 거부됨.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "로그아웃 성공")
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.logout(userDetails.getUid());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "내 정보 조회",
            description = "현재 로그인 사용자 정보 반환. uid, name, email, role만 노출 (내부 id 절대 미노출).")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증 필요")
    })
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(authService.getMe(userDetails));
    }
}