package com.backend.rule.rules;

import com.backend.sensor.ControlCommand;
import com.backend.sensor.ControlCommand.Action;
import com.backend.sensor.SensorData;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

import java.time.LocalTime;

@Rule(name = "HumidityRule", priority = 3)
public class HumidityRule {

    private static final double HUMIDITY_ON  = 60.0;
    private static final double HUMIDITY_OFF = 80.0;

    private boolean sprinklerOn = false;

    @Condition
    public boolean evaluate(@Fact("sensorData") SensorData data) {
        if (!sprinklerOn && data.getHumidity() < HUMIDITY_ON) return true;
        if (sprinklerOn  && data.getHumidity() > HUMIDITY_OFF) return true;
        return false;
    }

    @org.jeasy.rules.annotation.Action
    public void execute(@Fact("sensorData") SensorData data,
                        @Fact("command") ControlCommand cmd) {
        LocalTime now = LocalTime.now();
        boolean isMidday = now.isAfter(LocalTime.of(11, 0)) && now.isBefore(LocalTime.of(14, 0));

        if (!sprinklerOn && data.getHumidity() < HUMIDITY_ON) {
            if (isMidday) {
                cmd.add(Action.SPRINKLER_OFF,
                    String.format("습도 %.1f%% 낮지만 한낮(11~14시)이라 스프링클러 금지", data.getHumidity()));
            } else {
                sprinklerOn = true;
                cmd.add(Action.SPRINKLER_ON,
                    String.format("습도 %.1f%% (기준 %.1f%% 미만) → 스프링클러 작동", data.getHumidity(), HUMIDITY_ON));
            }
        } else if (sprinklerOn && data.getHumidity() > HUMIDITY_OFF) {
            sprinklerOn = false;
            cmd.add(Action.SPRINKLER_OFF,
                String.format("습도 %.1f%% (기준 %.1f%% 이상) → 스프링클러 정지", data.getHumidity(), HUMIDITY_OFF));
        }
    }
}
