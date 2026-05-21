package com.backend.simulation;

import com.backend.rule.FarmRuleEngine;
import com.backend.sensor.ControlCommand;
import com.backend.sensor.SensorData;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SimulationService {

    private final FarmRuleEngine ruleEngine;

    private static final Map<String, SensorData> PRESET_SCENARIOS = Map.of(
        "HEAT_WAVE", SensorData.builder()
            .temperature(42.0).humidity(30.0).lux(900.0).co2(850.0)
            .latitude(37.5).longitude(127.0).build(),
        "COLD_WAVE", SensorData.builder()
            .temperature(-10.0).humidity(25.0).lux(100.0).co2(700.0)
            .latitude(37.5).longitude(127.0).build(),
        "HIGH_CO2", SensorData.builder()
            .temperature(24.0).humidity(65.0).lux(600.0).co2(1500.0)
            .latitude(37.5).longitude(127.0).build(),
        "DRY", SensorData.builder()
            .temperature(26.0).humidity(35.0).lux(700.0).co2(750.0)
            .latitude(37.5).longitude(127.0).build(),
        "NIGHT", SensorData.builder()
            .temperature(18.0).humidity(70.0).lux(0.0).co2(600.0)
            .latitude(37.5).longitude(127.0).build()
    );

    public SimulationResult simulate(SimulationRequest req) {
        SensorData data = SensorData.builder()
                .temperature(req.getTemperature())
                .humidity(req.getHumidity())
                .lux(req.getLux())
                .co2(req.getCo2())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .build();

        return runSimulation(req.getScenario() != null ? req.getScenario() : "CUSTOM", data);
    }

    public SimulationResult simulatePreset(String scenario) {
        SensorData data = PRESET_SCENARIOS.getOrDefault(scenario.toUpperCase(),
                PRESET_SCENARIOS.get("HEAT_WAVE"));
        return runSimulation(scenario, data);
    }

    public List<SimulationResult> simulateAll() {
        List<SimulationResult> results = new ArrayList<>();
        PRESET_SCENARIOS.forEach((name, data) ->
                results.add(runSimulation(name, data)));
        return results;
    }

    private SimulationResult runSimulation(String scenario, SensorData data) {
        ControlCommand cmd = ruleEngine.evaluate(data);

        List<String> actions = cmd.getActions().stream()
                .map(Enum::name)
                .toList();

        boolean safe = actions.stream().noneMatch(a ->
                a.equals("FAN_ON") && actions.contains("SPRINKLER_ON"));

        return SimulationResult.builder()
                .scenario(scenario)
                .temperature(data.getTemperature())
                .humidity(data.getHumidity())
                .lux(data.getLux())
                .co2(data.getCo2())
                .triggeredActions(actions)
                .reasons(cmd.getReasons())
                .safe(safe)
                .build();
    }
}
