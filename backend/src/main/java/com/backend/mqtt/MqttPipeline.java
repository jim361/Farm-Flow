package com.backend.mqtt;

import com.backend.rule.FarmRuleEngine;
import com.backend.sensor.ControlCommand;
import com.backend.sensor.SensorData;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MqttPipeline {

    private final FarmRuleEngine ruleEngine;
    private final MqttPahoMessageHandler mqttOutboundHandler;
    private final ObjectMapper objectMapper;

    @Value("${mqtt.topic.control}")
    private String controlTopic;

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleSensorMessage(Message<String> message) {
        String topic   = (String) message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC);
        String payload = message.getPayload();

        try {
            SensorData data = objectMapper.readValue(payload, SensorData.class);
            log.info("센서 데이터 수신 [{}]: temp={}, humidity={}, lux={}, co2={}",
                topic, data.getTemperature(), data.getHumidity(), data.getLux(), data.getCo2());

            ControlCommand cmd = ruleEngine.evaluate(data);

            if (!cmd.isEmpty()) {
                String cmdJson = objectMapper.writeValueAsString(cmd);
                Message<String> outMessage = MessageBuilder
                    .withPayload(cmdJson)
                    .setHeader(MqttHeaders.TOPIC, controlTopic)
                    .setHeader(MqttHeaders.QOS, 1)
                    .build();

                mqttOutboundHandler.handleMessage(outMessage);
                log.info("제어 명령 발행 [{}]: {}", controlTopic, cmdJson);
            }

        } catch (Exception e) {
            log.error("센서 메시지 처리 실패 [topic={}]: {}", topic, e.getMessage());
        }
    }
}
