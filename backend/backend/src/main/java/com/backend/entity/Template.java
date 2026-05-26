package com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "templates")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String uid;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "crop_type", length = 50)
    private String cropType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "flow_data", columnDefinition = "jsonb")
    private String flowData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rule_data", columnDefinition = "jsonb")
    private String ruleData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "schedule_data", columnDefinition = "jsonb")
    private String scheduleData;

    @Column(length = 100)
    private String author;

    @Column(name = "download_cnt")
    @Builder.Default
    private Integer downloadCnt = 0;

    public void incrementDownloadCnt() {
        this.downloadCnt = (this.downloadCnt == null ? 0 : this.downloadCnt) + 1;
    }
}