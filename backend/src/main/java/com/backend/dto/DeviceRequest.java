package com.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Schema(description = "장치 등록 요청")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DeviceRequest {

    @Schema(
            description = "장치 타입 — SENSOR(센서) 또는 ACTUATOR(제어기)",
            example = "SENSOR",
            allowableValues = {"SENSOR", "ACTUATOR"},
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String deviceType;

    @Schema(
            description = "외부 장치 UID — 비우면 서버에서 자동 생성",
            example = "DEV-TEMP"
    )
    private String uid;

    @Schema(
            description = "센서 종류 — deviceType=SENSOR 일 때만 입력",
            example = "temperature",
            allowableValues = {"temperature", "humidity", "co2", "light"}
    )
    private String sensorType;

    @Schema(
            description = "제어기 종류 — deviceType=ACTUATOR 일 때만 입력",
            example = "fan",
            allowableValues = {"boiler", "fan", "pump"}
    )
    private String actuatorType;

    @Schema(
            description = "MQTT 토픽 — 비우면 서버에서 자동 생성",
            example = "farmflow/devices/DEV-TEMP/telemetry"
    )
    private String mqttTopic;

    @Schema(
            description = "사용자에게 보여줄 장치 이름",
            example = "온도센서-1호",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String name;
}
