# Farm Flow MQTT demo setup

This branch is a starter scaffold for the presentation flow where a laptop acts as a fake sensor by publishing MQTT telemetry.

## Server PC

Run the broker with the existing backend services:

```bash
cd backend
docker compose up -d postgres influxdb redis mqtt
```

Expose the broker as one of these addresses:

- Preferred: `mqtt.<domain>:1883`
- Fallback on the presentation network: `<server-pc-ip>:1883`

The broker is intentionally open for the demo:

- protocol: raw MQTT
- port: `1883`
- anonymous access: enabled

## Device registration

Register a sensor from the web app. The backend will return an MQTT topic on the device object:

```txt
farmflow/devices/{deviceUid}/telemetry
```

Example:

```txt
farmflow/devices/DEV-0001/telemetry
```

## MQTT Explorer publish payload

Use MQTT Explorer on the laptop and publish to the device topic:

```json
{
  "deviceUid": "DEV-0001",
  "sensorType": "temperature",
  "value": 27.4,
  "unit": "C",
  "measuredAt": "2026-05-25T10:30:00+09:00"
}
```

Useful sensor types for the demo:

- `temperature`
- `humidity`
- `co2`
- `light`

## Next implementation step

Add a backend MQTT subscriber that listens to `farmflow/devices/+/telemetry`, validates the `deviceUid`, stores the latest reading, and exposes it to the dashboard polling API.
