package org.example.farmflow.rules;

import org.jeasy.rules.annotation.Action;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

@Rule(name = "Humidity Rule")
public class HumidityRule {
    @Condition
    public boolean when(@Fact("humi") double humi) {
        return humi > 80.0; // 습도 80% 초과 시
    }

    @Action
    public void then() {
        System.out.println("💧 [RuleEngine] 습도가 80%를 넘었습니다! 환기 팬을 가동합니다.");
    }
}