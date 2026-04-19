package org.example.farmflow.dto;

import lombok.Data;

@Data
public class SensorData {
    private String farmUid;
    private String greenhouseUid;
    private String sensorType;
    private double value;
}