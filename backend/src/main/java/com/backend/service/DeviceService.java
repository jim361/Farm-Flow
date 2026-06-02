package com.backend.service;

import com.backend.dto.DeviceRequest;
import com.backend.dto.DeviceResponse;
import com.backend.entity.Device;
import com.backend.repository.DeviceRepository;
import com.backend.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceService {

    private final DeviceRepository deviceRepository;

    @Transactional
    public DeviceResponse createDevice(String greenhouseUid, DeviceRequest request) {
        validateRequest(request);

        String requestedUid = request.getUid() == null ? null : request.getUid().trim();
        if (requestedUid != null && !requestedUid.isBlank()) {
            return findByUidAndGreenhouse(requestedUid, greenhouseUid)
                    .map(device -> updateExistingDevice(device, greenhouseUid, request, requestedUid))
                    .orElseGet(() -> createNewDevice(greenhouseUid, request, requestedUid));
        }

        String uid;
        do {
            uid = IdGenerator.generateDeviceUid();
        } while (!deviceRepository.findAllByUid(uid).isEmpty());

        return createNewDevice(greenhouseUid, request, uid);
    }

    public List<DeviceResponse> getDevicesByGreenhouse(String greenhouseUid) {
        String topicMarker = greenhouseTopicMarker(greenhouseUid);
        return deviceRepository.findAll()
                .stream()
                .filter(device -> device.getMqttTopic() != null && device.getMqttTopic().contains(topicMarker))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeviceResponse updateStatus(String greenhouseUid, String deviceUid, String status) {
        if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status) && !"ERROR".equals(status)) {
            throw new IllegalStateException("status는 ACTIVE / INACTIVE / ERROR만 허용됩니다.");
        }
        Device device = findByUidAndOptionalGreenhouse(deviceUid, greenhouseUid)
                .orElseThrow(() -> new IllegalArgumentException("장치를 찾을 수 없습니다. UID: " + deviceUid));
        device.setStatus(status);
        return toResponse(device);
    }

    @Transactional
    public void deleteDevice(String greenhouseUid, String deviceUid) {
        Device device = findByUidAndOptionalGreenhouse(deviceUid, greenhouseUid)
                .orElseThrow(() -> new IllegalArgumentException("장치를 찾을 수 없습니다. UID: " + deviceUid));
        deviceRepository.delete(device);
    }

    public List<DeviceResponse> getAllDevices() {
        return deviceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<DeviceResponse> getDevicesByDeviceType(String deviceType) {
        if (!"SENSOR".equals(deviceType) && !"ACTUATOR".equals(deviceType)) {
            throw new IllegalStateException("deviceType은 SENSOR 또는 ACTUATOR만 허용됩니다.");
        }
        return deviceRepository.findByDeviceType(deviceType)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void validateRequest(DeviceRequest request) {
        if (request.getDeviceType() == null || request.getDeviceType().isBlank()) {
            throw new IllegalStateException("deviceType은 필수입니다.");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalStateException("name은 필수입니다.");
        }
        if (!"SENSOR".equals(request.getDeviceType()) && !"ACTUATOR".equals(request.getDeviceType())) {
            throw new IllegalStateException("deviceType은 SENSOR 또는 ACTUATOR만 허용됩니다.");
        }
    }

    private DeviceResponse createNewDevice(String greenhouseUid, DeviceRequest request, String uid) {
        String requestedTopic = request.getMqttTopic() == null ? null : request.getMqttTopic().trim();
        String mqttTopic = requestedTopic == null || requestedTopic.isBlank()
                ? buildMqttTopic(greenhouseUid, request.getDeviceType(), uid)
                : requestedTopic;

        Device device = Device.builder()
                .uid(uid)
                .name(request.getName())
                .deviceType(request.getDeviceType())
                .sensorType(request.getSensorType())
                .actuatorType(request.getActuatorType())
                .mqttTopic(mqttTopic)
                .status("ACTIVE")
                .build();

        return toResponse(deviceRepository.save(device));
    }

    private DeviceResponse updateExistingDevice(Device device, String greenhouseUid, DeviceRequest request, String uid) {
        String requestedTopic = request.getMqttTopic() == null ? null : request.getMqttTopic().trim();
        String mqttTopic = requestedTopic == null || requestedTopic.isBlank()
                ? buildMqttTopic(greenhouseUid, request.getDeviceType(), uid)
                : requestedTopic;

        device.setName(request.getName());
        device.setDeviceType(request.getDeviceType());
        device.setSensorType(request.getSensorType());
        device.setActuatorType(request.getActuatorType());
        device.setMqttTopic(mqttTopic);
        device.setStatus("ACTIVE");
        return toResponse(device);
    }

    private Optional<Device> findByUidAndGreenhouse(String uid, String greenhouseUid) {
        String topicMarker = greenhouseTopicMarker(greenhouseUid);
        return deviceRepository.findAllByUid(uid)
                .stream()
                .filter(device -> device.getMqttTopic() != null && device.getMqttTopic().contains(topicMarker))
                .findFirst();
    }

    private Optional<Device> findByUidAndOptionalGreenhouse(String uid, String greenhouseUid) {
        if (greenhouseUid == null || greenhouseUid.isBlank()) {
            return deviceRepository.findAllByUid(uid).stream().findFirst();
        }
        return findByUidAndGreenhouse(uid, greenhouseUid);
    }

    private String greenhouseTopicMarker(String greenhouseUid) {
        return "/greenhouses/" + greenhouseUid + "/";
    }

    private String buildMqttTopic(String greenhouseUid, String deviceType, String deviceUid) {
        String suffix = "SENSOR".equals(deviceType) ? "telemetry" : "command";
        return "farmflow/greenhouses/" + greenhouseUid + "/devices/" + deviceUid + "/" + suffix;
    }

    private DeviceResponse toResponse(Device device) {
        return DeviceResponse.builder()
                .uid(device.getUid())
                .name(device.getName())
                .deviceType(device.getDeviceType())
                .sensorType(device.getSensorType())
                .actuatorType(device.getActuatorType())
                .mqttTopic(device.getMqttTopic())
                .status(device.getStatus())
                .build();
    }
}
