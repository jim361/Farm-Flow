# Farm Flow MQTT demo setup

This branch is a starter scaffold for the presentation flow where a laptop acts as a fake sensor by publishing MQTT telemetry and displaying actuator commands.

## Server PC

Run the broker with the existing backend services:

```bash
cd backend
docker compose up -d postgres influxdb redis mqtt
```

Expose the broker as one of these addresses:

- MQTT Explorer: `mqtt.<domain>:1883`
- Browser simulator: `ws://mqtt.<domain>:9001`
- Fallback on the presentation network: `<server-pc-ip>:1883` or `ws://<server-pc-ip>:9001`

The broker is intentionally open for the demo:

- raw MQTT port: `1883`
- MQTT over WebSocket port: `9001`
- anonymous access: enabled

## Browser sensor and fan simulator

Open this file on the laptop:

```txt
tools/mqtt-sensor-simulator.html
```

Use one of these broker URLs:

```txt
ws://mqtt.<domain>:9001
ws://<server-pc-ip>:9001
ws://localhost:9001
```

The simulator shows temperature, humidity, CO2, light, and a ventilation fan. Put the registered sensor UIDs into the sensor cards and the registered fan actuator UID into the fan card. After connecting to the broker, telemetry can be published manually or automatically.

The fan card subscribes to this command topic:

```txt
farmflow/devices/{fanDeviceUid}/command
```

When the backend workflow publishes an `ON` command, the fan card switches to running and spins on screen. `OFF` stops it.

## Device registration

Register sensors and the fan actuator from the web app. The backend will return an MQTT topic on each device object.

Sensor telemetry topic:

```txt
farmflow/devices/{deviceUid}/telemetry
```

Fan command topic:

```txt
farmflow/devices/{fanDeviceUid}/command
```

## Sensor telemetry payload

Use the simulator or MQTT Explorer to publish to the sensor topic:

```json
{
  "deviceUid": "DEV-TEMP",
  "sensorType": "temperature",
  "value": 31.5,
  "unit": "C",
  "measuredAt": "2026-05-25T10:30:00+09:00"
}
```

Useful sensor types for the demo:

- `temperature`
- `humidity`
- `co2`
- `light`

## Fan command payload

The backend workflow should publish this payload to the fan command topic when the temperature rule is triggered:

```json
{
  "deviceUid": "DEV-FAN",
  "command": "ON",
  "source": "workflow",
  "reason": "temperature > 30",
  "issuedAt": "2026-05-25T10:30:03+09:00"
}
```

Stop command:

```json
{
  "deviceUid": "DEV-FAN",
  "command": "OFF",
  "source": "workflow",
  "reason": "temperature <= 30",
  "issuedAt": "2026-05-25T10:31:00+09:00"
}
```

## Demo scenario

1. Register a temperature sensor and a ventilation fan in the web app.
2. Build a workflow that connects the temperature sensor to the fan.
3. Use the rule `temperature > 30` to publish `ON` to `farmflow/devices/{fanUid}/command`.
4. Open `tools/mqtt-sensor-simulator.html` on the laptop.
5. Enter the registered temperature sensor UID and fan UID.
6. Raise the temperature above 30 and publish telemetry.
7. Confirm that the website dashboard updates and the simulator fan switches to running.

## Next implementation step

Add a backend MQTT subscriber that listens to `farmflow/devices/+/telemetry`, validates the `deviceUid`, stores the latest reading, evaluates the active workflow rule, and publishes fan commands to `farmflow/devices/{fanDeviceUid}/command`.
