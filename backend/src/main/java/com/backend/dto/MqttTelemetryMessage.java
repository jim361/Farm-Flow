package com.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MqttTelemetryMessage {
    private String deviceUid;
    private String greenhouse;
    private String greenhouseUid;
    private String sensorType;
    private Double value;
    private String unit;
    private String measuredAt;
}
