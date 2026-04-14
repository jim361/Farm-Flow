package com.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor // @Builder를 사용하려면 모든 필드를 포함하는 생성자가 필요합니다.
public class DeviceResponse {
    private Long id;
    private String deviceType;
    private String sensorType;
    private String actuatorType;
    private String status;
}