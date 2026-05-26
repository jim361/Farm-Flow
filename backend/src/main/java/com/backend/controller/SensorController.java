package com.backend.controller;

import com.backend.rule.FarmRuleEngine;
import com.backend.sensor.ControlCommand;
import com.backend.sensor.SensorData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sensor")
@RequiredArgsConstructor
public class SensorController {

    private final FarmRuleEngine ruleEngine;

    @PostMapping("/evaluate")
    public ResponseEntity<ControlCommand> evaluate(@RequestBody SensorData data) {
        ControlCommand result = ruleEngine.evaluate(data);
        return ResponseEntity.ok(result);
    }
}
