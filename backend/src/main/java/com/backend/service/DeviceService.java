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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceService {

    private final DeviceRepository deviceRepository;

    /**
     * FR-DEV-001: 기기 등록
     * URL: POST /greenhouses/{greenhouseUid}/devices
     * mqtt_topic 자동 생성: kr/{farmUid}/{greenhouseUid}/{deviceType}/{deviceUid}
     * farmUid는 현재 greenhouses 엔티티 미구현으로 "FARM-XXX" 플레이스홀더 사용.
     * Greenhouse 엔티티 구현 후 조회로 교체하세요.
     */
    @Transactional
    public DeviceResponse createDevice(String greenhouseUid, DeviceRequest request) {
        if (request.getDeviceType() == null || request.getDeviceType().isBlank()) {
            throw new IllegalStateException("deviceType은 필수입니다.");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalStateException("name은 필수입니다.");
        }
        if (!"SENSOR".equals(request.getDeviceType()) && !"ACTUATOR".equals(request.getDeviceType())) {
            throw new IllegalStateException("deviceType은 SENSOR 또는 ACTUATOR만 허용됩니다.");
        }

        // UID 중복 시 재시도
        String uid;
        do {
            uid = IdGenerator.generateDeviceUid();
        } while (deviceRepository.findByUid(uid).isPresent());

        String mqttTopic = buildMqttTopic(greenhouseUid, request.getDeviceType(), uid);

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

    /** FR-DEV-002: 하우스별 기기 목록 조회 */
    public List<DeviceResponse> getDevicesByGreenhouse(String greenhouseUid) {
        // greenhouseUid로 greenhouseId 조회가 필요하나,
        // Greenhouse 엔티티 미구현으로 임시 전체 반환.
        // Greenhouse 구현 후 findByGreenhouseId() 로 교체하세요.
        return deviceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** FR-DEV-002: 기기 상태 변경 */
    @Transactional
    public DeviceResponse updateStatus(String deviceUid, String status) {
        if (!"ACTIVE".equals(status) && !"INACTIVE".equals(status) && !"ERROR".equals(status)) {
            throw new IllegalStateException("status는 ACTIVE / INACTIVE / ERROR만 허용됩니다.");
        }
        Device device = deviceRepository.findByUid(deviceUid)
                .orElseThrow(() -> new IllegalArgumentException("장치를 찾을 수 없습니다. UID: " + deviceUid));
        device.setStatus(status);
        return toResponse(device); // 더티체킹으로 저장
    }

    /** 기기 삭제 */
    @Transactional
    public void deleteDevice(String deviceUid) {
        Device device = deviceRepository.findByUid(deviceUid)
                .orElseThrow(() -> new IllegalArgumentException("장치를 찾을 수 없습니다. UID: " + deviceUid));
        deviceRepository.delete(device);
    }

    /** 로직 빌더 전체 목록 (deviceType 필터 없이) */
    public List<DeviceResponse> getAllDevices() {
        return deviceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /** 로직 빌더 타입 필터 */
    public List<DeviceResponse> getDevicesByDeviceType(String deviceType) {
        if (!"SENSOR".equals(deviceType) && !"ACTUATOR".equals(deviceType)) {
            throw new IllegalStateException("deviceType은 SENSOR 또는 ACTUATOR만 허용됩니다.");
        }
        return deviceRepository.findByDeviceType(deviceType)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── 내부 유틸 ─────────────────────────────────────────────────────────────

    /**
     * MQTT 토픽 자동 생성
     * 형식: kr/{farmUid}/{greenhouseUid}/{sensor|actuator}/{deviceUid}
     */
    private String buildMqttTopic(String greenhouseUid, String deviceType, String deviceUid) {
        String typeSegment = "SENSOR".equals(deviceType) ? "sensor" : "actuator";
        // farmUid는 Greenhouse 엔티티 조회로 대체 필요 (현재 플레이스홀더)
        return "kr/FARM-XXX/" + greenhouseUid + "/" + typeSegment + "/" + deviceUid;
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