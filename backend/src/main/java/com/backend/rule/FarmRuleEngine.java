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
import org.jeasy.rules.core.DefaultRulesEngine;
import org.jeasy.rules.core.RulesEngineParameters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FarmRuleEngine {

    private final RulesEngine rulesEngine;

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
        rules.register(new Co2Rule());
        rules.register(new TemperatureRule());
        rules.register(new HumidityRule());
        rules.register(new LightRule());

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
