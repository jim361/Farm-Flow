package com.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WorkflowRequest {
    private String name;
    private String flowData;
    private String ruleData;
    private Long deviceId; // 추가
}