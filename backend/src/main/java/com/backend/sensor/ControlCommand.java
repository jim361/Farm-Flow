package com.backend.sensor;

import lombok.Getter;
import java.util.ArrayList;
import java.util.List;

/**
 * Rule Engine이 판단한 제어 명령 결과
 *
 * ※ @Builder + @NoArgsConstructor 혼용 시 @Builder.Default가 무시되는
 *   Lombok 버그를 피하기 위해 생성자를 직접 정의
 */
@Getter
public class ControlCommand {

    public enum Action {
        FAN_ON, FAN_OFF,
        SPRINKLER_ON, SPRINKLER_OFF,
        LED_ON, LED_OFF,
        VENTILATOR_ON, VENTILATOR_OFF
    }

    private final List<Action> actions = new ArrayList<>();
    private final List<String> reasons = new ArrayList<>();

    public void add(Action action, String reason) {
        actions.add(action);
        reasons.add(reason);
    }

    public boolean isEmpty() {
        return actions.isEmpty();
    }
}
