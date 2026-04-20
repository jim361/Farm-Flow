package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "devices") // SQL 테이블명과 일치
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String uid;         // 식별용 UID (예: DEV-12345)

    @Column(name = "greenhouse_id")
    private Long greenhouseId;  // 소속 온실 ID

    @Column(name = "device_type", nullable = false)
    private String deviceType;  // SENSOR 또는 ACTUATOR

    @Column(name = "sensor_type")
    private String sensorType;  // TEMP, HUMIDITY, CO2 등

    @Column(name = "actuator_type")
    private String actuatorType; // BOILER, VENT, PUMP 등

    @Column(nullable = false)
    private String name;        // 장치 표시 이름

    @Column(length = 20)
    private String status;      // ACTIVE, INACTIVE

    @Transient // DB 저장 제외, 실시간 값 표시용
    private String lastValue;
}