package com.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TemplateResponse {
    private Long id; // 템플릿은 공용이므로 관례에 따라 id를 쓰기도 하지만, 팀 규칙에 따라 uid가 필요하면 추후 수정 가능합니다.
    private String name;
    private String flowData;
    private String ruleData;
    private String scheduleData;
}