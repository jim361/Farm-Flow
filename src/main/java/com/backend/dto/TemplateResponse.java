package com.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Schema(description = "템플릿 조회 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateResponse {

    @Schema(description = "템플릿 외부 UID", example = "TPL-0001")
    private String uid;

    @Schema(description = "템플릿 이름", example = "딸기 재배 기본 템플릿")
    private String name;

    @Schema(description = "설명")
    private String description;

    @Schema(description = "작물 타입", example = "strawberry")
    private String cropType;

    @Schema(description = "작성자", example = "Farm Flow 팀")
    private String author;

    @Schema(description = "다운로드 수", example = "42")
    private Integer downloadCnt;

    @Schema(description = "캔버스 시각 데이터 (프론트 전용 JSON)")
    private String flowData;

    @Schema(description = "Rule Engine 실행 로직 (백엔드 전용 JSON)")
    private String ruleData;

    @Schema(description = "스케줄 데이터 JSON")
    private String scheduleData;
}