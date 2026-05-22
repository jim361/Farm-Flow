package com.backend.simulation;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping("/run")
    public ResponseEntity<SimulationResult> run(@RequestBody SimulationRequest req) {
        return ResponseEntity.ok(simulationService.simulate(req));
    }

    @GetMapping("/preset/{scenario}")
    public ResponseEntity<SimulationResult> preset(@PathVariable String scenario) {
        return ResponseEntity.ok(simulationService.simulatePreset(scenario));
    }

    @GetMapping("/all")
    public ResponseEntity<List<SimulationResult>> all() {
        return ResponseEntity.ok(simulationService.simulateAll());
    }
}
