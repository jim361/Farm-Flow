package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "templates")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "flow_data", columnDefinition = "jsonb")
    private String flowData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rule_data", columnDefinition = "jsonb")
    private String ruleData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "schedule_data", columnDefinition = "jsonb")
    private String scheduleData;
}