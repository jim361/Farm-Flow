package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "devices")
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
    private String uid;

    @Column(name = "greenhouse_id")
    private Long greenhouseId;

    @Column(name = "device_type", nullable = false)
    private String deviceType;

    @Column(name = "sensor_type")
    private String sensorType;

    @Column(name = "actuator_type")
    private String actuatorType;

    @Column(name = "mqtt_topic", length = 300)
    private String mqttTopic;

    @Column(nullable = false)
    private String name;

    @Column(length = 20)
    private String status;

    @Transient
    private String lastValue;
}
