package com.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "인증 응답 (JWT)")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    @Schema(description = "JWT 토큰")
    private String token;

    @Schema(description = "사용자 외부 UID (내부 id 미포함)", example = "FF-00001A")
    private String uid;

    @Schema(description = "이름", example = "홍길동")
    private String name;

    @Schema(description = "계정에 할당된 온실 UID", example = "GH-1A2B3C")
    private String greenhouseUid;

    @Schema(description = "역할", example = "USER")
    private String role;
}
