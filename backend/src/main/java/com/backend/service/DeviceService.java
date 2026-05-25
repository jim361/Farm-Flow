package com.backend.service;

import com.backend.entity.Device;
import com.backend.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceService {

    private static final String DEFAULT_STATUS = "ACTIVE";
    private static final String TELEMETRY_TOPIC_TEMPLATE = "farmflow/devices/%s/telemetry";

    private final DeviceRepository deviceRepository;

    @Transactional
    public Device createDevice(Device request) {
        String uid = hasText(request.getUid()) ? request.getUid() : generateDeviceUid();
        String mqttTopic = hasText(request.getMqttTopic())
                ? request.getMqttTopic()
                : String.format(TELEMETRY_TOPIC_TEMPLATE, uid);
        String status = hasText(request.getStatus()) ? request.getStatus() : DEFAULT_STATUS;

        Device device = Device.builder()
                .uid(uid)
                .greenhouseId(request.getGreenhouseId())
                .name(request.getName())
                .deviceType(request.getDeviceType())
                .sensorType(request.getSensorType())
                .actuatorType(request.getActuatorType())
                .mqttTopic(mqttTopic)
                .status(status)
                .lastValue("0")
                .build();

        return deviceRepository.save(device);
    }

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    public List<Device> getDevicesByDeviceType(String deviceType) {
        return deviceRepository.findByDeviceType(deviceType);
    }

    private String generateDeviceUid() {
        return "DEV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
