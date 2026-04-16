package com.backend.service;

import com.backend.entity.Device;
import com.backend.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceService {

    private final DeviceRepository deviceRepository;

    /**
     * 1. 새 장치 등록 (장치 등록 화면)
     */
    @Transactional
    public Device createDevice(Device request) {
        // 엔티티 구조 변경에 따른 빌더 로직 수정
        Device device = Device.builder()
                .uid(request.getUid())              // 프론트에서 생성한 UID 사용
                .greenhouseId(request.getGreenhouseId()) // 소속 온실 ID
                .name(request.getName())            // 예: "온실 A구역 온도 센서"
                .deviceType(request.getDeviceType()) // SENSOR 또는 ACTUATOR
                .sensorType(request.getSensorType()) // TEMP, HUMIDITY 등
                .actuatorType(request.getActuatorType()) // BOILER, PUMP 등
                .status("ACTIVE")                   // 등록 즉시 활성화 상태로 설정
                .lastValue("0")
                .build();

        return deviceRepository.save(device);
    }

    /**
     * 2. 전체 장치 목록 조회
     */
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    /**
     * 3. 디바이스 타입별 장치 필터링 (로직 빌더 라이브러리용)
     */
    public List<Device> getDevicesByDeviceType(String deviceType) {
        // 기존 findByCategory를 엔티티 필드명에 맞춰 findByDeviceType으로 변경 필요 (Repository도 확인)
        return deviceRepository.findByDeviceType(deviceType);
    }
}