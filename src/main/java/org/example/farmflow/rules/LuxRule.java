package org.example.farmflow.rules;

import org.jeasy.rules.annotation.Action;
import org.jeasy.rules.annotation.Condition;
import org.jeasy.rules.annotation.Fact;
import org.jeasy.rules.annotation.Rule;

@Rule(name = "Lux Rule")
public class LuxRule {
    @Condition
    public boolean when(@Fact("lux") double lux) {
        return lux < 200.0;
    }

    @Action
    public void then() {
        System.out.println("☀️ [RuleEngine] 조도 부족! 보온 커튼 작동");
    }
}