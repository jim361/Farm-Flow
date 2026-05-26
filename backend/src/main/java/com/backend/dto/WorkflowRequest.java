package com.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "워크플로우 저장/수정 요청")
@Getter
@NoArgsConstructor
public class WorkflowRequest {

    @Schema(description = "워크플로우 이름", example = "딸기 재배 자동화")
    private String name;

    @Schema(description = "워크플로우 설명", example = "온도 기반 팬 자동 제어")
    private String description;

    @Schema(description = "캔버스 시각 데이터 (프론트 전용 JSON)")
    private String flowData;

    @Schema(description = "Rule Engine 실행 로직 (백엔드 전용 JSON)")
    private String ruleData;

    @Schema(description = "연결할 하우스 외부 UID", example = "GH-001")
    private String greenhouseUid;
}