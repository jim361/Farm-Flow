package com.backend.rule;

import com.backend.rule.rules.Co2Rule;
import com.backend.rule.rules.HumidityRule;
import com.backend.rule.rules.LightRule;
import com.backend.rule.rules.TemperatureRule;
import com.backend.sensor.ControlCommand;
import com.backend.sensor.SensorData;
import com.backend.tracing.TracingService;
import org.jeasy.rules.api.Facts;
import org.jeasy.rules.api.Rules;
import org.jeasy.rules.api.RulesEngine;
import org.jeasy.rules.api.RulesEngineParameters;
import org.jeasy.rules.core.DefaultRulesEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FarmRuleEngine {

    private final RulesEngine rulesEngine;

    // 싱글턴 인스턴스 유지 — 내부 상태(fanOn 등 hysteresis)가 호출 간 보존됨
    private final Co2Rule co2Rule = new Co2Rule();
    private final TemperatureRule temperatureRule = new TemperatureRule();
    private final HumidityRule humidityRule = new HumidityRule();
    private final LightRule lightRule = new LightRule();

    @Autowired(required = false)
    private TracingService tracingService;

    public FarmRuleEngine() {
        RulesEngineParameters params = new RulesEngineParameters()
            .priorityThreshold(Integer.MAX_VALUE)
            .skipOnFirstAppliedRule(false)
            .skipOnFirstFailedRule(false);

        this.rulesEngine = new DefaultRulesEngine(params);
    }

    public ControlCommand evaluate(SensorData data) {
        return evaluate(data, null);
    }

    public ControlCommand evaluate(SensorData data, String workflowUid) {
        ControlCommand cmd = new ControlCommand();

        Rules rules = new Rules();
        rules.register(co2Rule);
        rules.register(temperatureRule);
        rules.register(humidityRule);
        rules.register(lightRule);

        Facts facts = new Facts();
        facts.put("sensorData", data);
        facts.put("command", cmd);

        rulesEngine.fire(rules, facts);

        if (tracingService != null && workflowUid != null && !cmd.isEmpty()) {
            tracingService.publish(workflowUid, "FarmRuleEngine", true, cmd);
        }

        return cmd;
    }
}
