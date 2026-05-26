package com.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import java.time.LocalDateTime;

@Schema(description = "워크플로우 조회 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowResponse {

    @Schema(description = "워크플로우 내부 ID", example = "1")
    private Long id;

    @Schema(description = "워크플로우 외부 UID", example = "WF-A1B2")
    private String uid;

    @Schema(description = "워크플로우 이름", example = "딸기 재배 자동화")
    private String name;

    @Schema(description = "워크플로우 설명")
    private String description;

    @Schema(description = "캔버스 시각 데이터 (프론트 전용 JSON)")
    private String flowData;

    @Schema(description = "Rule Engine 실행 로직 (백엔드 전용 JSON)")
    private String ruleData;

    @Schema(description = "워크플로우 상태", example = "DRAFT")
    private String status;

    @Schema(description = "버전", example = "1")
    private Integer version;

    @Schema(description = "생성 일시", example = "2026-04-09T10:00:00")
    private LocalDateTime createdAt;

    @Schema(description = "수정 일시", example = "2026-04-09T12:00:00")
    private LocalDateTime updatedAt;
}