package org.example.farmflow.rules;

import org.jeasy.rules.annotation.Action;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

@Rule(name = "CO2 Rule")
public class Co2Rule {
    @Condition
    public boolean when(@Fact("co2") double co2) {
        return co2 < 400.0; // 이산화탄소 농도 400ppm 미만 시
    }

    @Action
    public void then() {
        System.out.println("🌿 [RuleEngine] CO2 농도가 낮습니다. 광합성 효율을 확인하세요.");
    }
}