package com.backend.controller;

import com.backend.entity.Device;
import com.backend.repository.DeviceRepository;
import com.backend.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // [추가] 프론트엔드(Vite/React) 서버의 접속을 허용
public class DeviceController {

    private final DeviceService deviceService; // Repository 대신 Service를 사용하도록 변경 권장
    private final DeviceRepository deviceRepository;

    // 1. 전체 장치 목록 조회
    @GetMapping
    public List<Device> getAllDevices() {
        return deviceService.getAllDevices();
    }

    // 2. 디바이스 타입별 장치 조회 (로직 빌더용)
    // [수정] category -> deviceType으로 파라미터와 메서드명 변경
    @GetMapping("/filter")
    public List<Device> getDevicesByDeviceType(@RequestParam String deviceType) {
        return deviceRepository.findByDeviceType(deviceType);
    }

    // 3. 새 장치 등록
    @PostMapping
    public Device createDevice(@RequestBody Device device) {
        // [수정] 비즈니스 로직이 포함된 Service의 createDevice를 호출
        return deviceService.createDevice(device);
    }
}