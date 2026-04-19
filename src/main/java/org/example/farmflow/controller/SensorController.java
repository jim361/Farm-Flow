package org.example.farmflow.controller;

import org.example.farmflow.dto.SensorData;
import org.example.farmflow.service.SensorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sensor")
public class SensorController {

    @Autowired
    private SensorService sensorService;

    @PostMapping("/check")
    public ResponseEntity<String> checkRules(@RequestBody SensorData data) {
        // 팀 데이터 구조(value)에 맞춰서 서비스 호출
        // 현재 규칙 엔진이 4개 값을 동시에 받으므로, 일단은 받은 값을 해당 타입에 넣고 나머지는 기본값으로 처리합니다.
        double temp = "TEMPERATURE".equals(data.getSensorType()) ? data.getValue() : 25.0;
        double humi = "HUMIDITY".equals(data.getSensorType()) ? data.getValue() : 50.0;
        double co2 = "CO2".equals(data.getSensorType()) ? data.getValue() : 450.0;
        double lux = "LUX".equals(data.getSensorType()) ? data.getValue() : 200.0;

        sensorService.processSensorData(temp, humi, co2, lux);

        return ResponseEntity.ok("✅ [" + data.getSensorType() + "] 데이터 판별 완료!");
    }
}