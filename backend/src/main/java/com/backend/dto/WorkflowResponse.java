package com.backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowResponse {
    private Long id;
    private String uid;
    private String name;
    private String flowData;
    private String ruleData;
    private Long deviceId; // 추가
    private LocalDateTime createdAt;
}