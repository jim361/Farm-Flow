package com.backend.controller;

import com.backend.dto.AuthResponse;
import com.backend.dto.LoginRequest;
import com.backend.dto.SignupRequest;
import com.backend.dto.UserResponse;
import com.backend.security.CustomUserDetails;
import com.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "FR-AUTH: 인증/계정")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@org.springframework.web.bind.annotation.RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@org.springframework.web.bind.annotation.RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.logout(userDetails.getUid());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(authService.getMe(userDetails));
    }

    @Operation(summary = "아이디 찾기")
    @RequestBody(
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(example = "{\"email\": \"user@farm.com\"}"),
                    examples = @ExampleObject(value = "{\"email\": \"user@farm.com\"}")
            )
    )
    @PostMapping("/find-id")
    public ResponseEntity<Map<String, String>> findId(
            @org.springframework.web.bind.annotation.RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.findIdByEmail(body.get("email")));
    }

    @Operation(summary = "비밀번호 찾기")
    @RequestBody(
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(example = "{\"email\": \"user@farm.com\"}"),
                    examples = @ExampleObject(value = "{\"email\": \"user@farm.com\"}")
            )
    )
    @PostMapping("/find-pw")
    public ResponseEntity<Map<String, String>> findPw(
            @org.springframework.web.bind.annotation.RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.findPwByEmail(body.get("email")));
    }

    @Operation(summary = "현재 비밀번호 검증")
    @RequestBody(
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(example = "{\"password\": \"password123\"}"),
                    examples = @ExampleObject(value = "{\"password\": \"password123\"}")
            )
    )
    @PostMapping("/verify-password")
    public ResponseEntity<Map<String, String>> verifyPassword(
            @org.springframework.web.bind.annotation.RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.verifyPassword(userDetails, body.get("password"));
        return ResponseEntity.ok(Map.of("verified", "true"));
    }

    @Operation(summary = "비밀번호 변경")
    @RequestBody(
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(example = "{\"currentPassword\": \"password123\", \"newPassword\": \"newpass456\"}"),
                    examples = @ExampleObject(value = "{\"currentPassword\": \"password123\", \"newPassword\": \"newpass456\"}")
            )
    )
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @org.springframework.web.bind.annotation.RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        authService.changePassword(userDetails, body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
    }
}