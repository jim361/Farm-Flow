package com.backend.rule.rules;

import com.backend.sensor.ControlCommand;
import com.backend.sensor.ControlCommand.Action;
import com.backend.sensor.SensorData;
import com.backend.sensor.SunriseSunsetCalculator;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

@Rule(name = "LightRule", priority = 4)
public class LightRule {

    private static final double LUX_ON         = 500.0;
    private static final double LUX_NIGHT_ONLY = 200.0;

    private boolean ledOn = false;

    @Condition
    public boolean evaluate(@Fact("sensorData") SensorData data) {
        boolean daytime = SunriseSunsetCalculator.isDaytime(data.getLatitude(), data.getLongitude());
        boolean tooDark = daytime ? data.getLux() < LUX_NIGHT_ONLY : data.getLux() < LUX_ON;
        if (!ledOn && tooDark) return true;
        if (ledOn  && !tooDark) return true;
        return false;
    }

    @org.jeasy.rules.annotation.Action
    public void execute(@Fact("sensorData") SensorData data,
                        @Fact("command") ControlCommand cmd) {
        boolean daytime = SunriseSunsetCalculator.isDaytime(data.getLatitude(), data.getLongitude());
        boolean tooDark = daytime ? data.getLux() < LUX_NIGHT_ONLY : data.getLux() < LUX_ON;

        if (!ledOn && tooDark) {
            ledOn = true;
            String ctx = daytime ? "낮이지만 흐림(200Lux 미만)" : "야간";
            cmd.add(Action.LED_ON,
                String.format("%s → LED 보광등 점등 (660nm 적색 + 450nm 청색, 현재 %.0f Lux)", ctx, data.getLux()));
        } else if (ledOn && !tooDark) {
            ledOn = false;
            String ctx = daytime ? "낮 충분한 자연광" : "야간 충분한 조도";
            cmd.add(Action.LED_OFF,
                String.format("%s (%.0f Lux) → LED 보광등 소등", ctx, data.getLux()));
        }
    }
}
