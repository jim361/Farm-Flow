# Farm Flow — 데이터베이스 스키마 명세서

> **Schema Version:** v3
> **최초 작성일:** 2026-03-24 | **최종 수정일:** 2026-04-07
> **대상 환경:** Docker Compose (Local / Lab)

---

## 목차

- [1. 시스템 개요](#1-시스템-개요)
- [2. 인프라 구성](#2-인프라-구성)
- [3. PostgreSQL](#3-postgresql)
  - [3.1 설계 원칙](#31-설계-원칙)
  - [3.2 테이블 관계 (ERD 요약)](#32-테이블-관계-erd-요약)
  - [3.3 테이블 상세](#33-테이블-상세)
  - [3.4 인덱스](#34-인덱스)
  - [3.5 외래키 관계](#35-외래키-관계)
- [4. InfluxDB](#4-influxdb)
- [5. Redis](#5-redis)
- [6. 변경 이력](#6-변경-이력)

---

## 1. 시스템 개요

**Farm Flow**는 스마트팜 자동화 플랫폼으로, 센서 데이터 수집·분석, 워크플로우 기반 설비 제어, 스케줄 관리, 알림 발송 기능을 제공한다.
데이터 특성에 따라 세 가지 데이터베이스를 분리하여 운영한다.

| 역할 | DB | 주요 저장 데이터 |
|------|----|----------------|
| 관계형 데이터 | PostgreSQL 16 | 사용자, 농장, 워크플로우, 알림 규칙 등 구조화 데이터 |
| 시계열 데이터 | InfluxDB 2.7 | 센서 측정값 (온도·습도·CO₂·조도 등) |
| 캐시 / 세션 | Redis 7 | API 응답 캐시, 세션 토큰, 실시간 상태 |

---

## 2. 인프라 구성

모든 DB는 Docker Compose로 동일하게 구동된다.

### 컨테이너 구성표

| 항목 | PostgreSQL | InfluxDB | Redis |
|------|-----------|---------|-------|
| **Image** | `postgres:16` | `influxdb:2.7` | `redis:7-alpine` |
| **Container Name** | `farmflow-postgres` | `farmflow-influxdb` | `farmflow-redis` |
| **Port** | `5432` | `8086` | `6379` |
| **Volume** | `pg_data` | `influx_data` | `redis_data` |
| **Restart Policy** | `always` | `always` | `always` |

### 접속 정보

> **⚠️ 주의:** 아래 credential 항목은 환경 변수(`.env`) 또는 시크릿 관리 도구로 분리하여 관리해야 한다.
> 실제 운영 환경에서는 절대 코드에 하드코딩하지 않는다.

#### PostgreSQL

```
Host:     <DB_HOST>
Port:     5432
Database: farmflow
User:     farmflow
Password: your_password
```

#### InfluxDB

```
Host:         <DB_HOST>
Port:         8086
Organization: farmflow-org
Bucket:       sensor_data
Admin Token:  [REDACTED]
Retention:    168h (7일)
```

#### Redis

```
Host: <DB_HOST>
Port: 6379
Auth: (개발 환경 미설정 — 운영 배포 전 requirepass 설정 필수)
```

---

## 3. PostgreSQL

### 3.1 설계 원칙

#### PK / UID 분리 정책

모든 핵심 테이블은 내부용 정수 키와 외부 공개용 식별자를 분리한다.

| 컬럼 | 타입 | 역할 |
|------|------|------|
| `id` | `BIGSERIAL` | 내부 조인 전용 기본키. **API 응답에 노출하지 않는다.** |
| `uid` | `VARCHAR(20)` | 외부 공개 식별자. API 응답 및 외부 연동에 사용. `NOT NULL UNIQUE` |

#### 타임스탬프 규칙

- 생성 시각: `created_at` (`DEFAULT NOW()`)
- 변경 시각: `updated_at` (`DEFAULT NOW()`) — 변경 시 애플리케이션에서 명시적으로 갱신

#### JSONB 컬럼

구조가 가변적인 데이터는 `JSONB`로 저장한다.

| 컬럼명 | 사용 위치 | 설명 |
|--------|---------|------|
| `flow_data` | workflows, templates | 플로우 에디터 노드·엣지 구성 정의 |
| `rule_data` | workflows, templates | 자동화 규칙 조건·액션 정의 |
| `schedule_data` | templates | 권장 스케줄 설정 |
| `snapshot` | workflow_deploys | 배포 시점의 workflow 상태 스냅샷 |

#### `status` 값 정책

`workflows.status`는 아래 세 가지 값만 허용한다.

| 값 | 설명 |
|----|------|
| `DRAFT` | 편집 중, 미배포 상태 |
| `ACTIVE` | 배포 완료, 실행 중 |
| `INACTIVE` | 배포 후 중지된 상태 |

> `DEPLOYED` / `STOPPED` 표현은 **v3에서 폐기**되었다.

---

### 3.2 테이블 관계 (ERD 요약)

```
users
├── farms                     (1:N, user_id)
│   └── greenhouses           (1:N, farm_id)
│       ├── devices           (1:N, greenhouse_id)
│       ├── workflows         (1:N, greenhouse_id)
│       │   ├── workflow_deploys    (1:N, workflow_id)
│       │   └── workflow_schedules  (1:N, workflow_id)
│       └── alert_rules       (1:N, greenhouse_id)
│           └── alert_logs    (1:N, alert_rule_id)
├── workflows                 (1:N, user_id)
├── workflow_deploys          (1:N, deployed_by)
└── workflow_schedules        (1:N, user_id)

crop_thresholds               독립 참조 테이블 (FK 없음)
templates                     독립 참조 테이블 (FK 없음)
```

---

### 3.3 테이블 상세

---

#### `users` — 사용자

Farm Flow에 가입한 농장주 및 관리자 계정 정보를 저장한다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `uid` | `VARCHAR(20)` | NO | — | 외부 공개용 고유 식별자 |
| `email` | `VARCHAR(255)` | NO | — | 로그인 이메일 `UNIQUE` |
| `password_hash` | `VARCHAR(255)` | NO | — | bcrypt 해시 비밀번호 |
| `name` | `VARCHAR(100)` | NO | — | 사용자 이름 |
| `role` | `VARCHAR(20)` | YES | `'USER'` | 권한 (`USER` / `ADMIN`) |
| `created_at` | `TIMESTAMP` | YES | `NOW()` | 계정 생성 일시 |
| `updated_at` | `TIMESTAMP` | YES | `NOW()` | 최종 수정 일시 |

**Constraints:** `uid UNIQUE`, `email UNIQUE`

---

#### `farms` — 농장

사용자가 등록한 농장 정보를 저장한다. 사용자 1명은 여러 농장을 보유할 수 있다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `uid` | `VARCHAR(20)` | NO | — | 외부 공개용 고유 식별자 |
| `user_id` | `BIGINT` | YES | — | 소유 사용자 → `users.id` |
| `name` | `VARCHAR(200)` | NO | — | 농장 이름 |
| `address` | `VARCHAR(500)` | YES | — | 농장 주소 |
| `created_at` | `TIMESTAMP` | YES | `NOW()` | 등록 일시 |

**Foreign Key:** `user_id → users(id)`

---

#### `greenhouses` — 하우스

농장 내 개별 비닐하우스(재배동) 정보를 저장한다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `uid` | `VARCHAR(20)` | NO | — | 외부 공개용 고유 식별자 |
| `farm_id` | `BIGINT` | YES | — | 소속 농장 → `farms.id` |
| `name` | `VARCHAR(200)` | NO | — | 하우스 이름 |
| `crop_type` | `VARCHAR(50)` | YES | — | 재배 작물 종류 (예: `strawberry`) |
| `area_m2` | `DECIMAL(10,2)` | YES | — | 재배 면적 (㎡) |
| `created_at` | `TIMESTAMP` | YES | `NOW()` | 등록 일시 |

**Foreign Key:** `farm_id → farms(id)`

---

#### `devices` — 센서/기기

하우스에 설치된 센서 및 액추에이터 장치 정보를 저장한다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `uid` | `VARCHAR(20)` | NO | — | 외부 공개용 고유 식별자 |
| `greenhouse_id` | `BIGINT` | YES | — | 설치 하우스 → `greenhouses.id` |
| `device_type` | `VARCHAR(30)` | NO | — | 기기 분류 (`SENSOR` / `ACTUATOR`) |
| `sensor_type` | `VARCHAR(30)` | YES | — | 센서 종류 (`temperature` / `humidity` / `co2` / `light`) |
| `actuator_type` | `VARCHAR(30)` | YES | — | 액추에이터 종류 (`fan` / `pump` / `heater` 등) |
| `mqtt_topic` | `VARCHAR(300)` | YES | — | MQTT 구독·발행 토픽 경로 |
| `status` | `VARCHAR(20)` | YES | `'ACTIVE'` | 기기 상태 (`ACTIVE` / `INACTIVE`) |
| `created_at` | `TIMESTAMP` | YES | `NOW()` | 등록 일시 |

**Foreign Key:** `greenhouse_id → greenhouses(id)`

> `device_type = 'SENSOR'`인 경우 `sensor_type`을, `'ACTUATOR'`인 경우 `actuator_type`을 사용한다.
> 두 컬럼을 동시에 채우지 않는다.

---

#### `workflows` — 워크플로우

하우스 자동화 시나리오의 정의와 상태를 저장한다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `uid` | `VARCHAR(20)` | NO | — | 외부 공개용 고유 식별자 |
| `user_id` | `BIGINT` | YES | — | 작성 사용자 → `users.id` |
| `greenhouse_id` | `BIGINT` | YES | — | 적용 하우스 → `greenhouses.id` |
| `name` | `VARCHAR(200)` | NO | — | 워크플로우 이름 |
| `description` | `TEXT` | YES | — | 설명 |
| `flow_data` | `JSONB` | NO | `'{}'` | 플로우 에디터 노드·엣지 구성 데이터 |
| `rule_data` | `JSONB` | NO | `'{}'` | 자동화 규칙 조건·액션 정의 |
| `status` | `VARCHAR(20)` | YES | `'DRAFT'` | 상태 (`DRAFT` / `ACTIVE` / `INACTIVE`) |
| `version` | `INTEGER` | YES | `1` | 버전 번호 (배포 시 증가) |
| `created_at` | `TIMESTAMP` | YES | `NOW()` | 생성 일시 |
| `updated_at` | `TIMESTAMP` | YES | `NOW()` | 최종 수정 일시 |

**Foreign Keys:** `user_id → users(id)`, `greenhouse_id → greenhouses(id)`

---

#### `workflow_deploys` — 배포 이력

워크플로우의 배포·중지 이력을 기록한다. 변경 추적 및 롤백 기준점으로 활용한다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `uid` | `VARCHAR(20)` | NO | — | 외부 공개용 고유 식별자 |
| `workflow_id` | `BIGINT` | YES | — | 대상 워크플로우 → `workflows.id` |
| `deployed_by` | `BIGINT` | YES | — | 실행한 사용자 → `users.id` |
| `action` | `VARCHAR(20)` | NO | — | 수행 액션 (`DEPLOY` / `STOP` / `ROLLBACK`) |
| `snapshot` | `JSONB` | YES | — | 배포 시점의 `flow_data` + `rule_data` 스냅샷 |
| `deployed_at` | `TIMESTAMP` | YES | `NOW()` | 배포 실행 일시 |

**Foreign Keys:** `workflow_id → workflows(id)`, `deployed_by → users(id)`

---

#### `workflow_schedules` — 스케줄

워크플로우의 일일 자동 실행 시간 구간을 정의한다. 하나의 워크플로우에 여러 스케줄을 설정할 수 있다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `uid` | `VARCHAR(20)` | NO | — | 외부 공개용 고유 식별자 |
| `workflow_id` | `BIGINT` | **NO** | — | 대상 워크플로우 → `workflows.id` |
| `user_id` | `BIGINT` | **NO** | — | 스케줄 소유 사용자 → `users.id` |
| `start_time` | `TIME` | NO | — | 일일 시작 시각 (예: `06:00:00`) |
| `end_time` | `TIME` | NO | — | 일일 종료 시각 (예: `22:00:00`) |
| `is_active` | `BOOLEAN` | YES | `true` | 스케줄 활성화 여부 |
| `created_at` | `TIMESTAMP` | YES | `NOW()` | 생성 일시 |
| `updated_at` | `TIMESTAMP` | YES | `NOW()` | 최종 수정 일시 |

**Foreign Keys:** `workflow_id → workflows(id)`, `user_id → users(id)`

> `workflow_id`와 `user_id`는 `NOT NULL` — 스케줄 생성 시 반드시 두 값을 모두 제공해야 한다.

---

#### `crop_thresholds` — 작물별 환경 기준값

작물 종류별·생육 단계별 센서 안전/최적/위험 범위 기준값을 저장한다.
알림 발동 판단 및 자동화 규칙의 참조 데이터로 사용한다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `crop_type` | `VARCHAR(50)` | NO | — | 작물 종류 (예: `strawberry`) |
| `sensor_type` | `VARCHAR(30)` | NO | — | 센서 종류 (예: `temperature`, `humidity`, `co2`, `light`) |
| `growth_stage` | `VARCHAR(30)` | YES | `'ALL'` | 생육 단계 (`ALL` / `SEEDLING` / `GROWING` 등) |
| `safe_min` | `DECIMAL(10,2)` | YES | — | 안전 범위 최솟값 |
| `safe_max` | `DECIMAL(10,2)` | YES | — | 안전 범위 최댓값 |
| `optimal_min` | `DECIMAL(10,2)` | YES | — | 최적 범위 최솟값 |
| `optimal_max` | `DECIMAL(10,2)` | YES | — | 최적 범위 최댓값 |
| `critical_min` | `DECIMAL(10,2)` | YES | — | 위험 범위 최솟값 (이 미만이면 위험 알림) |
| `critical_max` | `DECIMAL(10,2)` | YES | — | 위험 범위 최댓값 (이 초과이면 위험 알림) |
| `unit` | `VARCHAR(20)` | YES | — | 측정 단위 (예: `℃`, `%`, `ppm`, `lux`) |
| `source` | `VARCHAR(100)` | YES | — | 기준값 출처 (예: `smartfarm_korea_2024`) |
| `updated_at` | `TIMESTAMP` | YES | `NOW()` | 최종 수정 일시 |

**초기 시드 데이터 — 딸기(strawberry) 기준값:**

| `sensor_type` | `safe_min` | `safe_max` | `optimal_min` | `optimal_max` | `critical_min` | `critical_max` | `unit` |
|--------------|:----------:|:----------:|:-------------:|:-------------:|:--------------:|:--------------:|--------|
| `temperature` | 5.0 | 35.0 | 15.0 | 25.0 | 0.0 | 40.0 | ℃ |
| `humidity` | 40.0 | 90.0 | 60.0 | 80.0 | 20.0 | 95.0 | % |
| `co2` | 300 | 1200 | 800 | 1000 | 200 | 1500 | ppm |
| `light` | 2000 | 50000 | 15000 | 40000 | 0 | 70000 | lux |

---

#### `templates` — 샘플 템플릿

팀 또는 커뮤니티가 공유하는 워크플로우 + 스케줄 세트 템플릿을 저장한다.
사용자는 템플릿을 불러와 자신의 워크플로우로 복사할 수 있다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `uid` | `VARCHAR(20)` | NO | — | 외부 공개용 고유 식별자 |
| `name` | `VARCHAR(200)` | NO | — | 템플릿 이름 |
| `description` | `TEXT` | YES | — | 템플릿 설명 |
| `crop_type` | `VARCHAR(50)` | YES | — | 대상 작물 종류 |
| `flow_data` | `JSONB` | NO | `'{}'` | 워크플로우 노드·엣지 정의 |
| `rule_data` | `JSONB` | NO | `'{}'` | 자동화 규칙 정의 |
| `schedule_data` | `JSONB` | YES | `'{}'` | 권장 스케줄 설정 *(v3 신규)* |
| `author` | `VARCHAR(100)` | YES | — | 작성자 이름 또는 팀명 |
| `download_cnt` | `INTEGER` | YES | `0` | 다운로드(복사) 횟수 |
| `created_at` | `TIMESTAMP` | YES | `NOW()` | 등록 일시 |

---

#### `alert_rules` — 알림 규칙

하우스 센서값이 특정 조건을 충족할 때 발송할 알림 규칙을 정의한다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `greenhouse_id` | `BIGINT` | YES | — | 대상 하우스 → `greenhouses.id` |
| `sensor_type` | `VARCHAR(30)` | NO | — | 감시 센서 종류 |
| `condition_op` | `VARCHAR(10)` | NO | — | 비교 연산자 (`>` / `<` / `>=` / `<=` / `==`) |
| `threshold_val` | `DECIMAL(10,2)` | NO | — | 알림 발동 기준값 |
| `channel` | `VARCHAR(20)` | NO | — | 발송 채널 (`PUSH` / `SMS` / `EMAIL`) |
| `is_active` | `BOOLEAN` | YES | `true` | 알림 규칙 활성화 여부 |
| `created_at` | `TIMESTAMP` | YES | `NOW()` | 생성 일시 |

**Foreign Key:** `greenhouse_id → greenhouses(id)`

---

#### `alert_logs` — 알림 발송 이력

알림 규칙에 의해 실제 발송된 알림 이력을 기록한다.

| 컬럼명 | 타입 | Nullable | 기본값 | 설명 |
|--------|------|:--------:|--------|------|
| `id` | `BIGSERIAL` | NO | auto | 내부 기본키 |
| `alert_rule_id` | `BIGINT` | YES | — | 발동된 알림 규칙 → `alert_rules.id` |
| `sensor_value` | `DECIMAL(10,2)` | YES | — | 알림 발동 시점의 센서 측정값 |
| `message` | `TEXT` | YES | — | 발송된 알림 메시지 내용 |
| `channel` | `VARCHAR(20)` | YES | — | 실제 발송 채널 |
| `sent_at` | `TIMESTAMP` | YES | `NOW()` | 발송 일시 |

**Foreign Key:** `alert_rule_id → alert_rules(id)`

---

### 3.4 인덱스

| 인덱스명 | 테이블 | 컬럼 | 타입 | 목적 |
|---------|--------|------|------|------|
| `idx_users_uid` | `users` | `uid` | UNIQUE | `uid` 기반 조회 최적화 |
| `idx_farms_uid` | `farms` | `uid` | UNIQUE | `uid` 기반 조회 최적화 |
| `idx_greenhouses_uid` | `greenhouses` | `uid` | UNIQUE | `uid` 기반 조회 최적화 |
| `idx_devices_uid` | `devices` | `uid` | UNIQUE | `uid` 기반 조회 최적화 |
| `idx_workflows_uid` | `workflows` | `uid` | UNIQUE | `uid` 기반 조회 최적화 |
| `idx_deploys_uid` | `workflow_deploys` | `uid` | UNIQUE | `uid` 기반 조회 최적화 |
| `idx_schedules_uid` | `workflow_schedules` | `uid` | UNIQUE | `uid` 기반 조회 최적화 |
| `idx_templates_uid` | `templates` | `uid` | UNIQUE | `uid` 기반 조회 최적화 |
| `idx_schedules_workflow_id` | `workflow_schedules` | `workflow_id` | INDEX | 워크플로우별 스케줄 목록 조회 |
| `idx_schedules_user_id` | `workflow_schedules` | `user_id` | INDEX | 사용자별 스케줄 목록 조회 |

---

### 3.5 외래키 관계

| 자식 테이블 | 컬럼 | 부모 테이블 | 참조 컬럼 |
|------------|------|-----------|---------|
| `farms` | `user_id` | `users` | `id` |
| `greenhouses` | `farm_id` | `farms` | `id` |
| `devices` | `greenhouse_id` | `greenhouses` | `id` |
| `workflows` | `user_id` | `users` | `id` |
| `workflows` | `greenhouse_id` | `greenhouses` | `id` |
| `workflow_deploys` | `workflow_id` | `workflows` | `id` |
| `workflow_deploys` | `deployed_by` | `users` | `id` |
| `workflow_schedules` | `workflow_id` | `workflows` | `id` |
| `workflow_schedules` | `user_id` | `users` | `id` |
| `alert_rules` | `greenhouse_id` | `greenhouses` | `id` |
| `alert_logs` | `alert_rule_id` | `alert_rules` | `id` |

---

## 4. InfluxDB

센서 장치가 주기적으로 전송하는 측정값을 시계열로 저장한다.
고빈도 쓰기 성능과 시간 범위 기반 집계 쿼리에 최적화되어 있다.

### 버킷 구성

| 항목 | 값 |
|------|---|
| **Bucket** | `sensor_data` |
| **Organization** | `farmflow-org` |
| **Retention** | `168h` (7일 경과 후 자동 삭제) |
| **Shard group duration** | `24h` |

### Measurement 설계 규약

InfluxDB는 스키마가 자유롭지만, 일관성을 위해 아래 규약을 따른다.

```
Measurement: sensor_readings
```

#### Tags (인덱싱 대상, 문자열)

| Tag Key | 예시 값 | 설명 |
|---------|--------|------|
| `greenhouse_uid` | `GH_00123` | 하우스 uid |
| `device_uid` | `DEV_00456` | 기기 uid |
| `sensor_type` | `temperature` | 센서 종류 |
| `farm_uid` | `FARM_001` | 농장 uid |

#### Fields (측정값)

| Field Key | 타입 | 설명 |
|-----------|------|------|
| `value` | `float` | 센서 측정값 |

#### Timestamp

UTC 기준 나노초 단위로 기록한다.

### 쓰기 예시 (Line Protocol)

```
sensor_readings,greenhouse_uid=GH_001,device_uid=DEV_001,sensor_type=temperature,farm_uid=FARM_001 value=22.5 1712345678000000000
```

### 조회 예시 (Flux)

```flux
// 특정 하우스의 최근 1시간 온도 데이터 조회
from(bucket: "sensor_data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "sensor_readings")
  |> filter(fn: (r) => r["greenhouse_uid"] == "GH_001")
  |> filter(fn: (r) => r["sensor_type"] == "temperature")
  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)
```

### 데이터 보존 정책

| 보존 기간 | 대상 | 비고 |
|----------|------|------|
| **7일 (168h)** | `sensor_data` bucket | 기본 설정값 |
| 운영 환경 | 장기 보존 필요 시 별도 bucket 생성 또는 Retention 연장 필요 | — |

---

## 5. Redis

API 응답 속도 향상 및 세션 관리를 위한 인메모리 캐시로 사용한다.

### 서버 정보

| 항목 | 값 |
|------|---|
| **Version** | Redis 7.4 |
| **Port** | `6379` |
| **Persistence** | Volume mount (`redis_data`) — RDB 방식 |

### 키 네이밍 규약

```
{namespace}:{entity}:{identifier}:{field}
```

### 주요 키 패턴

| 키 패턴 | 타입 | TTL | 설명 |
|--------|------|-----|------|
| `session:{user_uid}` | String | 로그인 유지 시간 | 사용자 세션 토큰 |
| `cache:greenhouse:{uid}:latest` | Hash | 30 ~ 60s | 하우스 최신 센서값 캐시 |
| `cache:workflow:{uid}` | String | 변경 시 무효화 | 워크플로우 상태 캐시 |
| `lock:workflow:{uid}:deploy` | String | 작업 완료 시 해제 | 배포 중복 실행 방지 분산 락 |
| `rate_limit:{user_uid}:{endpoint}` | Counter | 1분 | API Rate Limiting 카운터 |

### 캐시 무효화 정책

| 이벤트 | 무효화 대상 키 |
|--------|--------------|
| 워크플로우 수정 | `cache:workflow:{uid}` |
| 워크플로우 배포 | `cache:workflow:{uid}`, `lock:workflow:{uid}:deploy` |
| 센서 데이터 수신 | `cache:greenhouse:{uid}:latest` (TTL 자동 만료) |

### 보안 주의사항

> **⚠️ 운영 환경 배포 전 필수 설정:**
> - `requirepass` 옵션으로 인증 비밀번호 설정
> - `bind` 옵션으로 접근 가능한 IP 제한
> - TLS 설정 (민감 데이터 전송 시)

---

## 6. 변경 이력

| 버전 | 날짜 | 담당자 | 주요 변경 내용 |
|------|------|--------|--------------|
| **v1** | 2026-03-24 | — | 초기 스키마 작성. `users` ~ `alert_logs`, `simulation_scenarios`, `simulation_results` 테이블 포함 |
| **v2** | 2026-03-24 | — | `devices.uid` 추가, `workflow_schedules` 신규 테이블 추가 |
| **v3** | 2026-04-07 | — | `workflows` / `workflow_deploys` / `workflow_schedules` / `templates` uid 추가, 내부PK/외부UID 분리 정책 전 테이블 일관 적용, `workflows.status` `DEPLOYED`/`STOPPED` → `ACTIVE`/`INACTIVE` 변경, `templates.schedule_data` 추가, `simulation_scenarios` / `simulation_results` 테이블 제거 |
