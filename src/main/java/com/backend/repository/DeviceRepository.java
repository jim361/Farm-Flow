package com.backend.repository;

import com.backend.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeviceRepository extends JpaRepository<Device, Long> {

    // [수정] 필드명이 deviceType으로 변경되었으므로 메서드 이름도 맞춰야 합니다.
    // 로직 빌더에서 SENSOR나 ACTUATOR만 따로 불러올 때 사용합니다.
    List<Device> findByDeviceType(String deviceType);

    // [추가 가능] 특정 하우스의 장비만 가져오고 싶을 때
    List<Device> findByGreenhouseId(Long greenhouseId);
}