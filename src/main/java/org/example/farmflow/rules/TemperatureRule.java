package org.example.farmflow.rules;

import org.jeasy.rules.annotation.Action;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

@Rule(name = "Temperature Rule", description = "30도 이상일 때 팬 작동 판단")
public class TemperatureRule {

    @Condition
    public boolean when(@Fact("temp") double temp) {
        return temp > 30.0;
    }

    @Action
    public void then() {
        System.out.println("=====================================");
        System.out.println("⚠️ [RuleEngine] 위험! 온도가 30도를 넘었습니다.");
        System.out.println(">>> 명령: 환기 팬(Fan) 가동을 시작합니다.");
        System.out.println("=====================================");
    }
}