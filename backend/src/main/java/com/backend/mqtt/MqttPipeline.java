package com.backend.mqtt;

import com.backend.dto.MqttCommandMessage;
import com.backend.dto.MqttTelemetryMessage;
import com.backend.entity.Workflow;
import com.backend.entity.WorkflowStatus;
import com.backend.repository.WorkflowRepository;
import com.backend.rule.FarmRuleEngine;
import com.backend.sensor.ControlCommand;
import com.backend.sensor.ControlCommand.Action;
import com.backend.sensor.SensorData;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class MqttPipeline {

    private static final String METRICS_KEY = "dashboard:metrics";
    private static final String ALERTS_KEY = "dashboard:alerts";
    private static final String ACTUATOR_STATE_KEY = "dashboard:actuator-state";
    private static final String DEFAULT_GREENHOUSE_UID = "GH-001";

    private final FarmRuleEngine ruleEngine;
    private final MqttPahoMessageHandler mqttOutboundHandler;
    private final ObjectMapper objectMapper;
    private final StringRedisTemplate redisTemplate;
    private final WorkflowRepository workflowRepository;

    @Value("${mqtt.topic.control}")
    private String controlTopic;

    @Value("${farmflow.mqtt.command-topic-prefix:farmflow/devices}")
    private String commandTopicPrefix;

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleSensorMessage(Message<String> message) {
        String topic = (String) message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC);
        String payload = message.getPayload();

        try {
            JsonNode root = objectMapper.readTree(payload);
            String greenhouseUid = resolveGreenhouseUid(topic, root);
            SensorData data = parseSensorData(root, greenhouseUid);
            log.info("Sensor data received [{} / {}]: temp={}, humidity={}, lux={}, co2={}",
                greenhouseUid, topic, data.getTemperature(), data.getHumidity(), data.getLux(), data.getCo2());

            String metricsJson = objectMapper.writeValueAsString(toDashboardMetrics(data));
            redisTemplate.opsForValue().set(metricsKey(greenhouseUid), metricsJson);
            if (DEFAULT_GREENHOUSE_UID.equals(greenhouseUid)) {
                redisTemplate.opsForValue().set(METRICS_KEY, metricsJson);
            }

            ControlCommand cmd = ruleEngine.evaluate(data);
            if (!cmd.isEmpty()) {
                String cmdJson = objectMapper.writeValueAsString(cmd);
                Message<String> outMessage = MessageBuilder
                    .withPayload(cmdJson)
                    .setHeader(MqttHeaders.TOPIC, controlTopic)
                    .setHeader(MqttHeaders.QOS, 1)
                    .build();

                mqttOutboundHandler.handleMessage(outMessage);
                log.info("Control command published [{}]: {}", controlTopic, cmdJson);
                publishActuatorCommands(greenhouseUid, cmd);
            }

            publishWorkflowCommands(greenhouseUid, data);
        } catch (Exception e) {
            log.error("Sensor message processing failed [topic={}]: {}", topic, e.getMessage());
        }
    }

    private void publishWorkflowCommands(String greenhouseUid, SensorData data) {
        List<Workflow> workflows = workflowRepository.findByStatusAndUserGreenhouseUid(
            WorkflowStatus.ACTIVE,
            normalizeGreenhouseUid(greenhouseUid)
        );
        for (Workflow workflow : workflows) {
            try {
                evaluateWorkflow(workflow, greenhouseUid, data);
            } catch (Exception e) {
                log.warn("Workflow evaluation skipped [{}]: {}", workflow.getUid(), e.getMessage());
            }
        }
    }

    private void evaluateWorkflow(Workflow workflow, String greenhouseUid, SensorData data) throws Exception {
        String flowData = workflow.getFlowData();
        if (flowData == null || flowData.isBlank() || "{}".equals(flowData.trim())) {
            return;
        }

        JsonNode root = objectMapper.readTree(flowData);
        JsonNode nodes = root.path("nodes");
        JsonNode edges = root.path("edges");
        if (!nodes.isArray() || !edges.isArray()) {
            return;
        }

        Set<String> triggeredActionIds = new HashSet<>();
        for (JsonNode conditionNode : nodes) {
            if (!"condition".equals(conditionNode.path("type").asText())) {
                continue;
            }
            String conditionId = conditionNode.path("id").asText();
            if (!hasIncomingSensor(conditionId, nodes, edges)) {
                continue;
            }
            if (!matchesCondition(conditionNode.path("data"), data)) {
                continue;
            }
            for (String actionId : outgoingActionIds(conditionId, nodes, edges)) {
                if (triggeredActionIds.add(actionId)) {
                    JsonNode actionNode = findNode(nodes, actionId);
                    publishWorkflowAction(workflow, greenhouseUid, conditionNode.path("data"), actionNode.path("data"));
                }
            }
        }
    }

    private boolean hasIncomingSensor(String conditionId, JsonNode nodes, JsonNode edges) {
        for (JsonNode edge : edges) {
            if (!conditionId.equals(edge.path("target").asText())) {
                continue;
            }
            JsonNode source = findNode(nodes, edge.path("source").asText());
            if ("sensor".equals(source.path("type").asText())) {
                return true;
            }
        }
        return false;
    }

    private List<String> outgoingActionIds(String conditionId, JsonNode nodes, JsonNode edges) {
        List<String> actionIds = new ArrayList<>();
        for (JsonNode edge : edges) {
            if (!conditionId.equals(edge.path("source").asText())) {
                continue;
            }
            JsonNode target = findNode(nodes, edge.path("target").asText());
            if ("action".equals(target.path("type").asText())) {
                actionIds.add(target.path("id").asText());
            }
        }
        return actionIds;
    }

    private JsonNode findNode(JsonNode nodes, String id) {
        for (JsonNode node : nodes) {
            if (id.equals(node.path("id").asText())) {
                return node;
            }
        }
        return objectMapper.createObjectNode();
    }

    private boolean matchesCondition(JsonNode dataNode, SensorData data) {
        String metric = dataNode.path("metric").asText("temperature").toLowerCase();
        String operator = dataNode.path("operator").asText(">");
        double threshold = dataNode.path("threshold").asDouble(30.0);
        double actual = switch (metric) {
            case "humidity" -> data.getHumidity();
            case "co2", "co₂" -> data.getCo2();
            case "light", "lux" -> data.getLux();
            default -> data.getTemperature();
        };

        return switch (operator) {
            case ">=" -> actual >= threshold;
            case "<" -> actual < threshold;
            case "<=" -> actual <= threshold;
            case "==", "=" -> Math.abs(actual - threshold) < 0.0001;
            default -> actual > threshold;
        };
    }

    private void publishWorkflowAction(Workflow workflow, String greenhouseUid, JsonNode conditionData, JsonNode actionData) throws Exception {
        String command = actionData.path("command").asText("ON").toUpperCase();
        String topic = actionData.path("commandTopic").asText();
        String deviceUid = resolveDeviceUid(topic, actionData.path("deviceUid").asText(null), actionData.path("name").asText(""));
        if (topic == null || topic.isBlank()) {
            topic = commandTopic(greenhouseUid, deviceUid);
        }

        String reason = String.format(
            "%s: %s",
            workflow.getName(),
            conditionData.path("expression").asText(conditionData.path("label").asText("조건 만족"))
        );
        MqttCommandMessage message = new MqttCommandMessage(
            deviceUid,
            command,
            workflow.getUid(),
            reason,
            OffsetDateTime.now().toString()
        );
        publishCommand(topic, message, command);
        recordCommandAlert(greenhouseUid, message, topic);
    }

    private String resolveDeviceUid(String topic, String explicitUid, String name) {
        if (explicitUid != null && !explicitUid.isBlank()) {
            return explicitUid;
        }
        if (topic != null) {
            String marker = "/devices/";
            int start = topic.indexOf(marker);
            if (start >= 0) {
                int valueStart = start + marker.length();
                int valueEnd = topic.indexOf("/", valueStart);
                if (valueEnd > valueStart) {
                    return topic.substring(valueStart, valueEnd);
                }
            }
        }
        if (name != null) {
            java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("DEV-[A-Z0-9-]+").matcher(name);
            if (matcher.find()) {
                return matcher.group();
            }
        }
        return "DEV-ACTION";
    }

    private static final Map<String, List<Action>> ACTUATOR_ON_ACTIONS = Map.of(
        "DEV-FAN", List.of(Action.FAN_ON, Action.VENTILATOR_ON),
        "DEV-SPRINKLER", List.of(Action.SPRINKLER_ON),
        "DEV-LED", List.of(Action.LED_ON)
    );

    private static final Map<String, List<Action>> ACTUATOR_OFF_ACTIONS = Map.of(
        "DEV-FAN", List.of(Action.FAN_OFF, Action.VENTILATOR_OFF),
        "DEV-SPRINKLER", List.of(Action.SPRINKLER_OFF),
        "DEV-LED", List.of(Action.LED_OFF)
    );

    private void publishActuatorCommands(String greenhouseUid, ControlCommand cmd) throws Exception {
        String reasons = String.join(", ", cmd.getReasons());
        for (String deviceUid : ACTUATOR_ON_ACTIONS.keySet()) {
            boolean turnOn = cmd.getActions().stream().anyMatch(ACTUATOR_ON_ACTIONS.get(deviceUid)::contains);
            boolean turnOff = cmd.getActions().stream().anyMatch(ACTUATOR_OFF_ACTIONS.get(deviceUid)::contains);
            if (!turnOn && !turnOff) {
                continue;
            }

            String commandStr = turnOn ? "ON" : "OFF";
            MqttCommandMessage command = new MqttCommandMessage(
                deviceUid, commandStr, "rule-engine", reasons, OffsetDateTime.now().toString()
            );

            publishCommand(commandTopic(greenhouseUid, deviceUid), command, commandStr);
            recordCommandAlert(greenhouseUid, command, commandTopic(greenhouseUid, deviceUid));

            if (DEFAULT_GREENHOUSE_UID.equals(greenhouseUid)) {
                publishCommand(commandTopicPrefix + "/" + deviceUid + "/command", command, commandStr);
            }
        }
    }

    private void publishCommand(String topic, MqttCommandMessage command, String commandStr) throws Exception {
        Message<String> outMessage = MessageBuilder
            .withPayload(objectMapper.writeValueAsString(command))
            .setHeader(MqttHeaders.TOPIC, topic)
            .setHeader(MqttHeaders.QOS, 1)
            .build();
        mqttOutboundHandler.handleMessage(outMessage);
        log.info("Actuator command published [{} -> {}]", topic, commandStr);
    }

    private void recordCommandAlert(String greenhouseUid, MqttCommandMessage command, String topic) {
        String normalizedGreenhouseUid = normalizeGreenhouseUid(greenhouseUid);
        String stateKey = String.join(":",
            ACTUATOR_STATE_KEY,
            normalizedGreenhouseUid,
            command.getSource(),
            command.getDeviceUid()
        );
        String previousCommand = redisTemplate.opsForValue().get(stateKey);
        if (command.getCommand().equals(previousCommand)) {
            return;
        }
        redisTemplate.opsForValue().set(stateKey, command.getCommand());

        try {
            String alertsKey = alertsKey(normalizedGreenhouseUid);
            removeCommandAlerts(alertsKey, command.getSource(), command.getDeviceUid());
            if (DEFAULT_GREENHOUSE_UID.equals(normalizedGreenhouseUid)) {
                removeCommandAlerts(ALERTS_KEY, command.getSource(), command.getDeviceUid());
            }
            if ("OFF".equals(command.getCommand())) {
                return;
            }

            String title = "ON".equals(command.getCommand()) ? "제어기 켜짐" : "제어기 꺼짐";
            String message = String.format(
                "%s %s - %s",
                command.getDeviceUid(),
                command.getCommand(),
                command.getReason() == null || command.getReason().isBlank() ? command.getSource() : command.getReason()
            );
            DashboardAlert alert = new DashboardAlert(
                command.getSource() + "-" + command.getDeviceUid() + "-" + command.getCommand() + "-" + System.currentTimeMillis(),
                title,
                message,
                command.getIssuedAt(),
                command.getSource(),
                command.getDeviceUid(),
                command.getCommand(),
                topic
            );
            String alertJson = objectMapper.writeValueAsString(alert);
            redisTemplate.opsForList().leftPush(alertsKey, alertJson);
            redisTemplate.opsForList().trim(alertsKey, 0, 49);
            if (DEFAULT_GREENHOUSE_UID.equals(normalizedGreenhouseUid)) {
                redisTemplate.opsForList().leftPush(ALERTS_KEY, alertJson);
                redisTemplate.opsForList().trim(ALERTS_KEY, 0, 49);
            }
        } catch (Exception e) {
            log.warn("Dashboard alert record skipped [{} / {}]: {}", command.getDeviceUid(), command.getCommand(), e.getMessage());
        }
    }

    private void removeCommandAlerts(String key, String source, String deviceUid) {
        List<String> current = redisTemplate.opsForList().range(key, 0, -1);
        if (current == null || current.isEmpty()) {
            return;
        }

        List<String> remaining = new ArrayList<>();
        for (String item : current) {
            try {
                DashboardAlert alert = objectMapper.readValue(item, DashboardAlert.class);
                if (source.equals(alert.source()) && deviceUid.equals(alert.deviceUid())) {
                    continue;
                }
            } catch (Exception ignored) {
                // Keep unknown entries instead of blocking fresh alert updates.
            }
            remaining.add(item);
        }

        redisTemplate.delete(key);
        if (!remaining.isEmpty()) {
            redisTemplate.opsForList().rightPushAll(key, remaining);
            redisTemplate.opsForList().trim(key, 0, 49);
        }
    }

    private SensorData parseSensorData(JsonNode root, String greenhouseUid) throws Exception {
        if (root.has("sensorType") && root.has("value")) {
            return mergeTelemetry(objectMapper.treeToValue(root, MqttTelemetryMessage.class), greenhouseUid);
        }
        return objectMapper.treeToValue(root, SensorData.class);
    }

    private SensorData mergeTelemetry(MqttTelemetryMessage telemetry, String greenhouseUid) throws Exception {
        SensorData current = currentDashboardSensorData(greenhouseUid);
        double value = telemetry.getValue() != null ? telemetry.getValue() : 0.0;
        String sensorType = telemetry.getSensorType() != null ? telemetry.getSensorType().toLowerCase() : "";

        switch (sensorType) {
            case "temperature", "temp" -> current.setTemperature(value);
            case "humidity" -> current.setHumidity(value);
            case "co2" -> current.setCo2(value);
            case "light", "lux" -> current.setLux(value);
            default -> log.warn("Unknown MQTT sensorType received: {}", telemetry.getSensorType());
        }

        if (current.getLatitude() == 0.0) {
            current.setLatitude(37.5);
        }
        if (current.getLongitude() == 0.0) {
            current.setLongitude(127.0);
        }
        return current;
    }

    private SensorData currentDashboardSensorData(String greenhouseUid) throws Exception {
        SensorData data = SensorData.builder()
            .temperature(24.1)
            .humidity(63.0)
            .co2(892.0)
            .lux(12740.0)
            .latitude(37.5)
            .longitude(127.0)
            .build();

        String stored = redisTemplate.opsForValue().get(metricsKey(greenhouseUid));
        if ((stored == null || stored.isBlank()) && DEFAULT_GREENHOUSE_UID.equals(greenhouseUid)) {
            stored = redisTemplate.opsForValue().get(METRICS_KEY);
        }
        if (stored == null || stored.isBlank()) {
            return data;
        }

        List<DashboardMetric> metrics = objectMapper.readValue(stored, new TypeReference<List<DashboardMetric>>() {});
        for (DashboardMetric metric : metrics) {
            switch (metric.id()) {
                case "temp" -> data.setTemperature(metric.value());
                case "humidity" -> data.setHumidity(metric.value());
                case "co2" -> data.setCo2(metric.value());
                case "light" -> data.setLux(metric.value());
                default -> {
                }
            }
        }
        return data;
    }

    private String resolveGreenhouseUid(String topic, JsonNode root) {
        String fromPayload = text(root, "greenhouseUid");
        if (fromPayload == null) {
            fromPayload = text(root, "greenhouse");
        }
        if (fromPayload != null) {
            return normalizeGreenhouseUid(fromPayload);
        }

        if (topic != null) {
            String marker = "farmflow/greenhouses/";
            int start = topic.indexOf(marker);
            if (start >= 0) {
                int valueStart = start + marker.length();
                int valueEnd = topic.indexOf("/", valueStart);
                if (valueEnd > valueStart) {
                    return normalizeGreenhouseUid(topic.substring(valueStart, valueEnd));
                }
            }
        }

        return DEFAULT_GREENHOUSE_UID;
    }

    private String text(JsonNode root, String fieldName) {
        JsonNode value = root.get(fieldName);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText();
        return text == null || text.isBlank() ? null : text;
    }

    private String normalizeGreenhouseUid(String greenhouseUid) {
        String normalized = greenhouseUid == null ? "" : greenhouseUid.trim();
        return normalized.isBlank() ? DEFAULT_GREENHOUSE_UID : normalized;
    }

    private String metricsKey(String greenhouseUid) {
        return METRICS_KEY + ":" + normalizeGreenhouseUid(greenhouseUid);
    }

    private String alertsKey(String greenhouseUid) {
        return ALERTS_KEY + ":" + normalizeGreenhouseUid(greenhouseUid);
    }

    private String commandTopic(String greenhouseUid, String deviceUid) {
        return "farmflow/greenhouses/" + normalizeGreenhouseUid(greenhouseUid) + "/devices/" + deviceUid + "/command";
    }

    private List<DashboardMetric> toDashboardMetrics(SensorData data) {
        return List.of(
            new DashboardMetric("temp", "온도", "°C", data.getTemperature(), 0.0, data.getTemperature() > 30 ? "warning" : "stable"),
            new DashboardMetric("humidity", "습도", "%", data.getHumidity(), 0.0, data.getHumidity() < 60 || data.getHumidity() > 80 ? "warning" : "stable"),
            new DashboardMetric("co2", "CO2", "ppm", data.getCo2(), 0.0, data.getCo2() > 1000 ? "warning" : "stable"),
            new DashboardMetric("light", "조도", "lux", data.getLux(), 0.0, data.getLux() < 500 ? "warning" : "stable")
        );
    }

    private record DashboardMetric(
        String id,
        String label,
        String unit,
        double value,
        double trend,
        String state
    ) {}

    private record DashboardAlert(
        String id,
        String title,
        String message,
        String time,
        String source,
        String deviceUid,
        String command,
        String topic
    ) {}
}
