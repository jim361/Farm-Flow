package com.backend.sensor;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorData {
    private double temperature;
    private double humidity;
    private double lux;
    private double co2;
    private double latitude;
    private double longitude;
}
