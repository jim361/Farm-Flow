package com.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MqttCommandMessage {
    private String deviceUid;
    private String command;
    private String source;
    private String reason;
    private String issuedAt;
}
