package com.backend.rule.rules;

import com.backend.sensor.ControlCommand;
import com.backend.sensor.ControlCommand.Action;
import com.backend.sensor.SensorData;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

@Rule(name = "TemperatureRule", priority = 2)
public class TemperatureRule {

    private static final double TEMP_ON  = 30.0;
    private static final double TEMP_OFF = 27.0;

    private boolean fanOn = false;

    @Condition
    public boolean evaluate(@Fact("sensorData") SensorData data) {
        if (!fanOn && data.getTemperature() > TEMP_ON) return true;
        if (fanOn  && data.getTemperature() < TEMP_OFF) return true;
        return false;
    }

    @org.jeasy.rules.annotation.Action
    public void execute(@Fact("sensorData") SensorData data,
                        @Fact("command") ControlCommand cmd) {
        if (!fanOn && data.getTemperature() > TEMP_ON) {
            fanOn = true;
            cmd.add(Action.FAN_ON,
                String.format("온도 %.1f°C 초과 (기준 %.1f°C) → 팬 가동", data.getTemperature(), TEMP_ON));
        } else if (fanOn && data.getTemperature() < TEMP_OFF) {
            fanOn = false;
            cmd.add(Action.FAN_OFF,
                String.format("온도 %.1f°C (기준 %.1f°C 이하) → 팬 정지", data.getTemperature(), TEMP_OFF));
        }
    }
}
