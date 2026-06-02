# Broker branch handoff guide

This document is for continuing the MQTT demo work on the lab computer. The goal is to make the `broker` branch work with the lab server without mixing unrelated teammate work into the MQTT changes.

## What this branch is for

Use `broker` only for the presentation demo flow:

1. The web app registers a temperature sensor and a ventilation fan.
2. The laptop simulator publishes temperature telemetry over MQTT.
3. The backend receives the telemetry.
4. The backend evaluates the workflow rule.
5. The backend publishes a fan command.
6. The laptop simulator shows the fan turning on.

## Files and folders to focus on

Only these paths are part of the MQTT demo work:

```txt
backend/docker-compose.yml
backend/mosquitto/mosquitto.conf
backend/src/main/resources/application.properties
backend/src/main/java/com/backend/dto/MqttTelemetryMessage.java
backend/src/main/java/com/backend/dto/MqttCommandMessage.java
backend/src/main/java/com/backend/entity/Device.java
backend/src/main/java/com/backend/service/DeviceService.java
docs/mqtt-demo-setup.md
tools/mqtt-sensor-simulator.html
```

When implementing the real server behavior, add new backend code under a dedicated MQTT/monitoring area such as:

```txt
backend/src/main/java/com/backend/mqtt/
backend/src/main/java/com/backend/controller/MonitoringController.java
backend/src/main/java/com/backend/entity/SensorReading.java
backend/src/main/java/com/backend/repository/SensorReadingRepository.java
backend/src/main/java/com/backend/service/MonitoringService.java
backend/src/main/java/com/backend/service/WorkflowRuntimeService.java
```

Frontend changes, if needed, should be limited to API base URL setup and the dashboard values that display live sensor readings.

## Avoid changing these unless absolutely necessary

These areas mostly belong to other teammates or existing UI work:

```txt
frontend/src/page/Login.tsx
frontend/src/page/Sign.tsx
frontend/src/page/FindId.tsx
frontend/src/page/FindPw.tsx
frontend/src/components/Scheduler/
frontend/src/page/Scheduler.tsx
frontend/src/page/TemplatePage.tsx
```

If a demo fix requires touching one of those files, keep the edit minimal and write the reason in the commit message.

## Lab computer setup

On the lab computer:

```bash
git clone https://github.com/jim361/Farm-Flow.git
cd Farm-Flow
git checkout broker
git pull origin broker
```

If `main` has newer teammate work that must be included:

```bash
git fetch origin
git checkout broker
git merge origin/main
```

Resolve conflicts only in files related to the MQTT demo unless the team agrees otherwise.

## MQTT broker ports

The broker exposes two ports:

```txt
1883  raw MQTT, useful for MQTT Explorer
9001  MQTT over WebSocket, required by tools/mqtt-sensor-simulator.html
```

Start the broker and supporting services:

```bash
cd backend
docker compose up -d postgres influxdb redis mqtt
```

## Simulator usage

Open this file on the laptop:

```txt
tools/mqtt-sensor-simulator.html
```

Use one of these broker URLs:

```txt
ws://mqtt.<domain>:9001
ws://<lab-server-ip>:9001
ws://localhost:9001
```

The fan simulator listens to:

```txt
farmflow/devices/{fanDeviceUid}/command
```

The backend should publish this when the workflow rule triggers:

```json
{
  "deviceUid": "DEV-FAN",
  "command": "ON",
  "source": "workflow",
  "reason": "temperature > 30",
  "issuedAt": "2026-05-25T10:30:03+09:00"
}
```

## Codex prompt for the lab computer

Paste this into Codex on the lab computer:

```txt
We are on branch broker of jim361/Farm-Flow. Please implement only the MQTT demo server path described in docs/broker-branch-handoff.md and docs/mqtt-demo-setup.md. Keep changes scoped to MQTT, monitoring, Device mqttTopic handling, dashboard live sensor polling if needed, and workflow command publishing. Avoid unrelated teammate UI files unless required for the demo.
```

## Acceptance checklist

- `docker compose up -d postgres influxdb redis mqtt` starts Mosquitto with ports `1883` and `9001`.
- A registered sensor has an MQTT telemetry topic like `farmflow/devices/{uid}/telemetry`.
- The backend subscribes to `farmflow/devices/+/telemetry`.
- Publishing temperature telemetry stores or caches the latest reading.
- `GET /api/v1/monitoring/current` returns the latest sensor values.
- A workflow rule such as `temperature > 30` publishes `ON` to `farmflow/devices/{fanUid}/command`.
- `tools/mqtt-sensor-simulator.html` shows the fan running after receiving the command.
