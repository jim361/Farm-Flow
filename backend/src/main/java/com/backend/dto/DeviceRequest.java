package com.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor // 테스트나 서비스에서 객체를 만들 때 편리합니다.
public class DeviceRequest {
    private String deviceType;   // SENSOR 또는 ACTUATOR
    private String sensorType;   // temperature, humidity 등
    private String actuatorType; // fan, pump 등
    private String name;         // 사용자에게 보여줄 이름
}