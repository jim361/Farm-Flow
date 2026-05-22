package com.backend.tracing;

import com.backend.sensor.ControlCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TracingService {

    private final SimpMessagingTemplate messagingTemplate;

    public void publish(String workflowUid, String ruleName,
                        boolean triggered, ControlCommand cmd) {
        TraceEvent event = TraceEvent.builder()
                .workflowUid(workflowUid)
                .ruleName(ruleName)
                .triggered(triggered)
                .actions(cmd.getActions().stream()
                        .map(Enum::name)
                        .toList())
                .reasons(cmd.getReasons())
                .build();

        String destination = "/topic/trace/" + workflowUid;
        messagingTemplate.convertAndSend(destination, event);
        log.info("트레이싱 이벤트 발행 [{}] ruleName={} triggered={}", workflowUid, ruleName, triggered);
    }
}
