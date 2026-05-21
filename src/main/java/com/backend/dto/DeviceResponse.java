package com.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "장치 조회 응답")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceResponse {

    @Schema(description = "장치 외부 UID", example = "DEV-A3X9")
    private String uid;

    @Schema(description = "장치 표시 이름", example = "온도센서-1호")
    private String name;

    @Schema(description = "장치 타입", example = "SENSOR")
    private String deviceType;

    @Schema(description = "센서 종류", example = "temperature")
    private String sensorType;

    @Schema(description = "제어기 종류", example = "fan")
    private String actuatorType;

    @Schema(description = "MQTT 토픽", example = "kr/FARM-001/GH-001/sensor/DEV-A3X9")
    private String mqttTopic;

    @Schema(description = "장치 상태", example = "ACTIVE")
    private String status;
}