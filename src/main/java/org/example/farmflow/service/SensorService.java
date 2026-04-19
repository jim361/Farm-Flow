package org.example.farmflow.service;

import org.example.farmflow.rules.Co2Rule;
import org.example.farmflow.rules.TemperatureRule;
import org.example.farmflow.rules.HumidityRule;
import org.example.farmflow.rules.LuxRule;
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

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<?> message) {
        String payload = message.getPayload().toString();
        System.out.println("📩 수신된 데이터: " + payload);

        Facts facts = new Facts();
        facts.put("temp", 35.5);
        facts.put("humi", 85.0);
        facts.put("co2", 350.0);
        facts.put("lux", 150.0);

        rulesEngine.fire(rules, facts);
    }
}