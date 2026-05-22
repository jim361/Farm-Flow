package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_deploys")
@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDeploy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String uid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id")
    private Workflow workflow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deployed_by")
    private User deployedBy;

    @Column(nullable = false, length = 20)
    private String action; // DEPLOY / STOP / ROLLBACK

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String snapshot;

    @Column(name = "deployed_at")
    @Builder.Default
    private LocalDateTime deployedAt = LocalDateTime.now();
}