package com.backend.simulation;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SimulationRequest {
    private double temperature;
    private double humidity;
    private double lux;
    private double co2;
    private double latitude  = 37.5;
    private double longitude = 127.0;
    private String scenario;
}
