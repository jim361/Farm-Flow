package com.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "내 정보 조회 응답 (내부 id 미노출)")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    @Schema(description = "외부 UID", example = "FF-00001A")
    private String uid;

    @Schema(description = "이름", example = "홍길동")
    private String name;

    @Schema(description = "이메일", example = "user@farm.com")
    private String email;

    @Schema(description = "역할", example = "USER")
    private String role;
}