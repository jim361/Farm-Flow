-- ========================================
-- Farm Flow PostgreSQL 초기화 스크립트
-- 작성일: 2026.03.24
-- 수정일: 2026.04.07 (v3)
--   v2: devices.uid 추가, workflow_schedules 신규
--   v3: workflows/workflow_deploys/workflow_schedules/templates uid 추가
--       모든 테이블에 내부PK/외부UID 분리 정책 일관 적용
--       workflows.status DEPLOYED/STOPPED → ACTIVE/INACTIVE
--       templates.schedule_data 추가
-- ========================================

-- 1. 사용자 테이블
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    uid           VARCHAR(20) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    role          VARCHAR(20) DEFAULT 'USER',
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- 2. 농장 테이블
CREATE TABLE farms (
    id         BIGSERIAL PRIMARY KEY,
    uid        VARCHAR(20) UNIQUE NOT NULL,
    user_id    BIGINT REFERENCES users(id),
    name       VARCHAR(200) NOT NULL,
    address    VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 하우스 테이블
CREATE TABLE greenhouses (
    id         BIGSERIAL PRIMARY KEY,
    uid        VARCHAR(20) UNIQUE NOT NULL,
    farm_id    BIGINT REFERENCES farms(id),
    name       VARCHAR(200) NOT NULL,
    crop_type  VARCHAR(50),
    area_m2    DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. 센서/기기 테이블
CREATE TABLE devices (
    id            BIGSERIAL PRIMARY KEY,
    uid           VARCHAR(20) UNIQUE NOT NULL,
    greenhouse_id BIGINT REFERENCES greenhouses(id),
    device_type   VARCHAR(30) NOT NULL,
    sensor_type   VARCHAR(30),
    actuator_type VARCHAR(30),
    mqtt_topic    VARCHAR(300),
    status        VARCHAR(20) DEFAULT 'ACTIVE',
    created_at    TIMESTAMP DEFAULT NOW()
);

-- 5. 워크플로우 테이블
CREATE TABLE workflows (
    id            BIGSERIAL PRIMARY KEY,
    uid           VARCHAR(20) UNIQUE NOT NULL,
    user_id       BIGINT REFERENCES users(id),
    greenhouse_id BIGINT REFERENCES greenhouses(id),
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    flow_data     JSONB NOT NULL DEFAULT '{}',
    rule_data     JSONB NOT NULL DEFAULT '{}',
    status        VARCHAR(20) DEFAULT 'DRAFT',
    version       INT DEFAULT 1,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- 6. 배포 이력 테이블
CREATE TABLE workflow_deploys (
    id          BIGSERIAL PRIMARY KEY,
    uid         VARCHAR(20) UNIQUE NOT NULL,
    workflow_id BIGINT REFERENCES workflows(id),
    deployed_by BIGINT REFERENCES users(id),
    action      VARCHAR(20) NOT NULL,
    snapshot    JSONB,
    deployed_at TIMESTAMP DEFAULT NOW()
);

-- 7. 스케줄 테이블 (FR-SCH)
CREATE TABLE workflow_schedules (
    id          BIGSERIAL PRIMARY KEY,
    uid         VARCHAR(20) UNIQUE NOT NULL,
    workflow_id BIGINT REFERENCES workflows(id) NOT NULL,
    user_id     BIGINT REFERENCES users(id) NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- 8. 작물별 환경 기준값 테이블
CREATE TABLE crop_thresholds (
    id            BIGSERIAL PRIMARY KEY,
    crop_type     VARCHAR(50) NOT NULL,
    sensor_type   VARCHAR(30) NOT NULL,
    growth_stage  VARCHAR(30) DEFAULT 'ALL',
    safe_min      DECIMAL(10,2),
    safe_max      DECIMAL(10,2),
    optimal_min   DECIMAL(10,2),
    optimal_max   DECIMAL(10,2),
    critical_min  DECIMAL(10,2),
    critical_max  DECIMAL(10,2),
    unit          VARCHAR(20),
    source        VARCHAR(100),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- 9. 샘플 템플릿 테이블
CREATE TABLE templates (
    id            BIGSERIAL PRIMARY KEY,
    uid           VARCHAR(20) UNIQUE NOT NULL,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    crop_type     VARCHAR(50),
    flow_data     JSONB NOT NULL DEFAULT '{}',
    rule_data     JSONB NOT NULL DEFAULT '{}',
    schedule_data JSONB DEFAULT '{}',
    author        VARCHAR(100),
    download_cnt  INT DEFAULT 0,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- 10. 알림 규칙 테이블
CREATE TABLE alert_rules (
    id            BIGSERIAL PRIMARY KEY,
    greenhouse_id BIGINT REFERENCES greenhouses(id),
    sensor_type   VARCHAR(30) NOT NULL,
    condition_op  VARCHAR(10) NOT NULL,
    threshold_val DECIMAL(10,2) NOT NULL,
    channel       VARCHAR(20) NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- 11. 알림 발송 이력 테이블
CREATE TABLE alert_logs (
    id            BIGSERIAL PRIMARY KEY,
    alert_rule_id BIGINT REFERENCES alert_rules(id),
    sensor_value  DECIMAL(10,2),
    message       TEXT,
    channel       VARCHAR(20),
    sent_at       TIMESTAMP DEFAULT NOW()
);

-- 인덱스
CREATE UNIQUE INDEX idx_users_uid        ON users(uid);
CREATE UNIQUE INDEX idx_farms_uid        ON farms(uid);
CREATE UNIQUE INDEX idx_greenhouses_uid  ON greenhouses(uid);
CREATE UNIQUE INDEX idx_devices_uid      ON devices(uid);
CREATE UNIQUE INDEX idx_workflows_uid    ON workflows(uid);
CREATE UNIQUE INDEX idx_deploys_uid      ON workflow_deploys(uid);
CREATE UNIQUE INDEX idx_schedules_uid    ON workflow_schedules(uid);
CREATE UNIQUE INDEX idx_templates_uid    ON templates(uid);
CREATE INDEX idx_schedules_workflow_id   ON workflow_schedules(workflow_id);
CREATE INDEX idx_schedules_user_id       ON workflow_schedules(user_id);

-- 테스트 데이터: 딸기 작물 환경 기준값
INSERT INTO crop_thresholds
    (crop_type, sensor_type, growth_stage, safe_min, safe_max, optimal_min, optimal_max, critical_min, critical_max, unit, source)
VALUES
    ('strawberry', 'temperature', 'ALL',  5.0, 35.0, 15.0, 25.0,  0.0, 40.0, '℃',   'smartfarm_korea_2024'),
    ('strawberry', 'humidity',    'ALL', 40.0, 90.0, 60.0, 80.0, 20.0, 95.0, '%',   'smartfarm_korea_2024'),
    ('strawberry', 'co2',         'ALL',  300, 1200,  800, 1000,  200, 1500, 'ppm', 'smartfarm_korea_2024'),
    ('strawberry', 'light',       'ALL', 2000, 50000, 15000, 40000, 0, 70000, 'lux', 'smartfarm_korea_2024');

-- init.sql 하단에 추가
INSERT INTO users (uid, email, password_hash, name, role)
VALUES ('USER-001', 'test@test.com', '1234', '테스트유저', 'ADMIN');

INSERT INTO farms (uid, user_id, name)
VALUES ('FARM-001', 1, '제 1 농장');

INSERT INTO greenhouses (uid, farm_id, name)
VALUES ('GH-001', 1, '테스트 온실 1호');