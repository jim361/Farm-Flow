package com.backend.simulation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResult {

    private String scenario;
    private double temperature;
    private double humidity;
    private double lux;
    private double co2;
    private List<String> triggeredActions;
    private List<String> reasons;
    private boolean safe;

    @Builder.Default
    private LocalDateTime simulatedAt = LocalDateTime.now();
}
