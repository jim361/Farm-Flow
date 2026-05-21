package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflows")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Workflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String uid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "greenhouse_id")
    private Long greenhouseId;

    private String name;

    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "flow_data", columnDefinition = "jsonb")
    private String flowData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rule_data", columnDefinition = "jsonb")
    private String ruleData;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private WorkflowStatus status = WorkflowStatus.DRAFT;

    @Builder.Default
    private Integer version = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}