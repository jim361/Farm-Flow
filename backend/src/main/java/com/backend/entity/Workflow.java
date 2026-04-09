package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workflow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String uid;            // 프론트엔드 Response와 매칭

    private String name;           // title에서 name으로 변경 (프론트엔드 item.name과 일치)

    @Column(columnDefinition = "jsonb")
    private String flowData;       // 노드/엣지 JSON 데이터

    @Column(columnDefinition = "jsonb")
    private String ruleData;       // 추가 로직 데이터

    private Long deviceId;         // 연결된 장치 ID

    private String description;

    @CreationTimestamp
    private LocalDateTime createdAt;
}