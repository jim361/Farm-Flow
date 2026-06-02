package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "devices")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String uid;

    // greenhouse_id FK — 실제 하우스 엔티티가 없으므로 Long으로 관리
    // (Greenhouse 엔티티 구현 시 @ManyToOne으로 교체)
    @Column(name = "greenhouse_id")
    private Long greenhouseId;

    @Column(name = "device_type", nullable = false, length = 30)
    private String deviceType;

    @Column(name = "sensor_type", length = 30)
    private String sensorType;

    @Column(name = "actuator_type", length = 30)
    private String actuatorType;

    @Column(name = "mqtt_topic", length = 300)
    private String mqttTopic;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}
