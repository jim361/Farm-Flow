package org.example.farmflow.service;

import org.example.farmflow.rules.*;
import org.jeasy.rules.api.Facts;
import org.jeasy.rules.api.Rules;
import org.jeasy.rules.api.RulesEngine;
import org.jeasy.rules.core.DefaultRulesEngine;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

@Service
public class SensorService {

    private final Rules rules = new Rules();
    private final RulesEngine rulesEngine = new DefaultRulesEngine();

    public SensorService() {
        rules.register(new TemperatureRule());
        rules.register(new HumidityRule());
        rules.register(new Co2Rule());
        rules.register(new LuxRule());
    }

    public void processSensorData(double temp, double humi, double co2, double lux) {
        Facts facts = new Facts();
        facts.put("temp", temp);
        facts.put("humi", humi);
        facts.put("co2", co2);
        facts.put("lux", lux);

        System.out.println("🚀 [RuleEngine] 데이터 판별 시작...");
        rulesEngine.fire(rules, facts);
    }

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<?> message) {
        // MQTT로 데이터가 들어와도 위 메서드를 실행!
        processSensorData(35.5, 85.0, 350.0, 150.0);
    }
}