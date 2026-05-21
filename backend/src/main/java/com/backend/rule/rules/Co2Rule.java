package com.backend.rule.rules;

import com.backend.sensor.ControlCommand;
import com.backend.sensor.ControlCommand.Action;
import com.backend.sensor.SensorData;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

@Rule(name = "Co2Rule", priority = 1)
public class Co2Rule {

    private static final double CO2_ON  = 1000.0;
    private static final double CO2_OFF = 800.0;

    private boolean ventilatorOn = false;

    @Condition
    public boolean evaluate(@Fact("sensorData") SensorData data) {
        if (!ventilatorOn && data.getCo2() > CO2_ON) return true;
        if (ventilatorOn  && data.getCo2() < CO2_OFF) return true;
        return false;
    }

    @org.jeasy.rules.annotation.Action
    public void execute(@Fact("sensorData") SensorData data,
                        @Fact("command") ControlCommand cmd) {
        if (!ventilatorOn && data.getCo2() > CO2_ON) {
            ventilatorOn = true;
            cmd.add(Action.VENTILATOR_ON,
                String.format("CO2 %.0fppm 초과 (기준 %.0fppm) → 강제 환기 가동", data.getCo2(), CO2_ON));
        } else if (ventilatorOn && data.getCo2() < CO2_OFF) {
            ventilatorOn = false;
            cmd.add(Action.VENTILATOR_OFF,
                String.format("CO2 %.0fppm (기준 %.0fppm 이하) → 환기 정지", data.getCo2(), CO2_OFF));
        }
    }
}
