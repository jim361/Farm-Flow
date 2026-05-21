package com.backend.tracing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TraceEvent {

    private String workflowUid;
    private String ruleName;
    private boolean triggered;
    private List<String> actions;
    private List<String> reasons;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
