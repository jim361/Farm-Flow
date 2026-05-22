package com.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "BearerAuth";

    @Bean
    public OpenAPI openAPI() {
        Info info = new Info()
                .title("Farm Flow API 명세서")
                .version("v1.0.0")
                .description("""
                        **담당:** FR-DEV · FR-WB · FR-ALGO · FR-TPL · FR-AUTH
                        
                        **Base URL:** `/api/v1`  |  **인증:** `Authorization: Bearer {JWT}`
                        
                        ---
                        
                        ### 구현된 플로우
                        
                        **[FR-AUTH] 인증**
                        - `POST /auth/signup` — 회원가입 + JWT 발급
                        - `POST /auth/login` — 로그인 + JWT 발급
                        - `POST /auth/logout` — 로그아웃 (Redis 세션 삭제)
                        - `GET /auth/me` — 내 정보 조회
                        
                        **[FR-DEV] 기기 관리**
                        - `GET /greenhouses/{uid}/devices` — 하우스별 기기 목록
                        - `POST /greenhouses/{uid}/devices` — 기기 등록 (mqtt_topic 자동생성)
                        - `PATCH /devices/{uid}/status` — 상태 변경
                        - `DELETE /devices/{uid}` — 기기 삭제
                        
                        **[FR-WB / FR-ALGO] 워크플로우**
                        - `POST /workflows` — 저장 (UID 자동 발급)
                        - `GET /workflows` — 내 목록 조회
                        - `GET /workflows/{uid}` — 상세 조회
                        - `PUT /workflows/{uid}` — 수정 (version 증가)
                        - `DELETE /workflows/{uid}` — 소프트 삭제
                        - `POST /workflows/{uid}/deploy` — 배포 (deploys 이력 기록)
                        - `POST /workflows/{uid}/stop` — 중지
                        
                        **[FR-TPL] 템플릿**
                        - `GET /templates?crop_type=` — 목록 (작물 필터)
                        - `GET /templates/{uid}` — 상세
                        - `POST /templates/{uid}/apply` — 워크플로우 복사 생성
                        """);

        SecurityScheme bearerScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT");

        return new OpenAPI()
                .info(info)
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components().addSecuritySchemes(BEARER_SCHEME, bearerScheme));
    }
}