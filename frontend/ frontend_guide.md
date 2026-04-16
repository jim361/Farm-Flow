# 🚀 Smart Farm Project: Frontend Collaboration Guide

## 1. 개요 (Context)
- **Stack:** Vite + React + TypeScript + Tailwind CSS
- **API Base:** `http://localhost:8080/api/v1` (Spring Boot)
- **협업 규칙** (Collaboration Rules)
1. **Branch:** Git-flow 방식을 따르며, `develop`에서 `feature/[기능명 또는 이름]` 브랜치를 생성해 작업한다. (예시: feature/su-dashboard)
2. **Strict Folder:** 본인 담당 페이지 외 수정 금지. (Sidebar, Topbar 등 공통 컴포넌트는 합의 후 수정, overriding 가능)
3. **API First:** 모든 개발은 .md 명세서 기준. 변경 시 코드 수정 전 명세서부터 업데이트한다. 업데이트한 부분은 주석으로 날짜 및 내용을 표기.
4. **Code Quality:** 파일은 기능별로 최대한 쪼개어 가독성을 높인다.
5. **Base URL:** API 주소는 전역 설정 파일에서 관리하며, 코드 내 직접 입력(Hard-coding)을 금지한다.
6. **Error Handling:** 모든 에러 응답은 합의된 규격({status, message})을 따른다.

---

## 2. 페이지별 API 명세 (Endpoint & Data)

🔵 공통 필드
사용자: uid (FFA3X9K2), email, name, role, createdAt 
기기(센서/액추에이터): uid (DEV-A3X9), device_type, sensor_type, actuator_type, status 
워크플로우(시뮬레이션): uid (WF-XXXX), name, flow_data(프론트용), rule_data(백엔드용), 
status 스케줄: uid (SCH-XXXX), start_time, end_time, days_of_week, status 
농장/하우스: farm_uid, greenhouse_uid, name, crop_type 

🔐 인증 API (Auth)Spring Security
| ID | Endpoint | Method | Response Elements | 설명 |
| :--- | :--- | :---: | :--- | :--- |
| A-01 | /api/v1/auth/signup | POST | uid, email, name |  |
| A-02 | /api/v1/auth/login | POST | uid, name, role, session_id |  |
| A-03 | /api/v1/auth/logout | POST | message | |
| A-04 | /api/v1/auth/me | GET | uid, email, name, role | |

📊 대시보드 API (Dashboard - FR-MON)Redis와 InfluxDB에서 실시간 및 이력 데이터를 가져오는 구조
| ID | Endpoint | Method | Response Elements | 설명 |
| :--- | :--- | :---: | :--- | :--- |
| D-01 | /api/v1/monitoring/{gh_uid}/current | GET | sensor_type, value, updated_at | Redis 기반 실시간 센서값  |
| D-02 | /api/v1/monitoring/{gh_uid}/history | GET | sensor_type, values: [{measured_at, value}] | InfluxDB 기반 과거 데이터  |
| D-03 | /api/v1/dashboard/summary | GET | farm_count, device_count, alert_count | 농장 전체 요약 정보  |

📅 스케줄러 API (Calendar - FR-SCH)workflow_schedules 테이블을 기반
| ID | Endpoint | Method | Response Elements | 설명 |
| :--- | :--- | :---: | :--- | :--- |
| C-01 | /api/v1/schedules/{gh_uid} | GET | uid, start_time, end_time, days_of_week | 특정 하우스의 스케줄 목록  |
| C-02 | /api/v1/schedules | POST | uid, workflow_uid, start_time, end_time | 스케줄 등록 (UID 추가 요청)  |
| C-03 | /api/v1/schedules/{sch_uid} | DELETE | message | 스케줄 삭제  |

🌡️ 기기 관리 API (Devices/Sensors)devices 테이블 스키마를 따름
| ID | Endpoint | Method | Response Elements | 설명 |
| :--- | :--- | :---: | :--- | :--- |
| S-01 | /api/v1/devices | GET | uid, device_type, sensor_type, status | |
| S-02 | /api/v1/devices | POST | uid, greenhouse_uid, device_type, mqtt_topic | 백엔드 토픽 자동 생성  |
| S-03 | /api/v1/devices/{dev_uid}/control | POST | command(ON/OFF), status | 액추에이터 제어 (MQTT 연동)  |

🤖 워크플로우(시뮬레이션) API (FR-WB)workflows 테이블의 flow_data와 rule_data이 핵심
| ID | Endpoint | Method | Response Elements | 설명 |
| :--- | :--- | :---: | :--- | :--- |
| M-01 | /api/v1/workflows | GET | uid, name, status, version | 내 워크플로우 목록  |
| M-02 | /api/v1/workflows | POST | uid, name, flow_data, rule_data | 새 로직 저장 (UID 추가 요청)  |
| M-03 | /api/v1/workflows/{w_uid}/deploy | POST | action, snapshot, deployed_at | 실제 환경 배포 및 이력 저장  |

📋 템플릿 API (FR-TPL)templates 테이블 기반 샘플 로직 조회입니다.
| ID | Endpoint | Method | Response Elements | 설명 |
| :--- | :--- | :---: | :--- | :--- |
| T-01 | /api/v1/templates | GET | uid, name, crop_type, description | |
| T-02 | /api/v1/templates/{t_uid} | GET | uid, flow_data, rule_data, schedule_data | |

## 3. 역할 분담 (Role Division)

### 👤 개발자 B (안수빈 - UI & Layout Specialist)
- **담당 폴더:** `src/pages/Dashboard/`, `src/pages/Schedular/`, `src/components/Sidebar`, `src/components/Topbar/`
- **핵심 업무:** - **조건부 레이아웃 설계:** Topbar는 전역 노출, Sidebar는 대시보드 페이지에서만 나타나도록 구조화.
  - **대시보드 위젯 UI(FR-MON):** 실시간 농장 데이터 카드형 UI 및 알림 리스트 구현.
  - **스케줄러 인터페이스(FR-SCH):** 투두리스트와 애플 캘린더 스타일의 일정 등록/조회 화면 구현.
  - **네비게이션 연동:** 페이지 간 이동 라우팅 처리.
- **AI 프롬프트 예시:** - "온도, 습도, CO2 수치를 보여주는 대시보드 위젯 카드를 Tailwind CSS로 만들어줘."
  - "현재 경로가 /dashboard일 때만 Sidebar를 렌더링하는 Layout 구조를 짜줘."

### 👤 개발자 C (김재윤 - Visual Logic Builder Specialist)
- **담당 폴더:** `src/pages/Login/`, `src/pages/Sign/`, `src/pages/Simulation/`, `src/pages/Template/`, `src/pages/Sensor/`
- **핵심 업무:** - **Figma 디자인:** 전체 프로젝트 시각적 가이드 및 UI 디자인.
  - **워크플로우 빌더(FR-WB):** React-flow 기반의 시각적 로직 빌더 UI 구현.
  - **로직 관리(FR-ALGO):** 워크플로우 저장 및 불러오기 UI/로직 구현.
  - **센서 (FR-DR):** 센서 등록 UI/로직 구현.
- **AI 프롬프트 예시:** - "React-flow를 사용하여 노드와 엣지를 드래그 앤 드롭으로 연결하는 로직 빌더를 만들어줘."

---

## 4. 공통 타입 정의 (TypeScript)
🔵 1. 공통 응답 및 인증 (Common & Auth)
/** 서버 공통 응답 규격 */
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

/** 사용자 정보 (users 테이블 기반)  */
export interface User {
  uid: string;           // FF + 6자리 (예: FFA3X9K2) [cite: 30]
  email: string;         // 
  name: string;          // 
  role: 'USER' | 'ADMIN'; // 
}

🌿 2. 농장 및 하우스 (Farm & Greenhouse)
/** 농장 및 하우스 정보 [cite: 35, 37] */
export interface Farm {
  uid: string;           // FARM- + 4자리 [cite: 30]
  name: string;          // [cite: 35]
  address: string;       // [cite: 35]
}

export interface Greenhouse {
  uid: string;           // GH- + 4자리 [cite: 30]
  farm_uid: string;      // farm_id(FK) 대신 외부 UID 사용 [cite: 37]
  name: string;          // [cite: 37]
  crop_type: string;     // [cite: 37]
  area_m2: number;       // [cite: 37]
}

📊 3. 모니터링 및 기기 (Monitoring & Devices)
/** 측정 데이터 및 기기 상태 [cite: 40, 61, 68] */
export interface RealtimeReading {
  greenhouse_uid: string; // [cite: 61]
  device_uid: string;     // device_id 대신 UID 사용 [cite: 61]
  sensor_type: 'temperature' | 'humidity' | 'co2' | 'light'; // [cite: 61]
  value: number;          // [cite: 61]
  updated_at: string;     // Redis 갱신 시각 
}

export interface Device {
  uid: string;            // DEV- + 4자리 [cite: 30]
  device_type: 'SENSOR' | 'ACTUATOR'; // [cite: 40]
  sensor_type?: string;   // [cite: 40]
  actuator_type?: string; // [cite: 40]
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR'; // [cite: 40]
  mqtt_topic: string;     // 백엔드 생성 값 [cite: 40]
}
🤖 4. 시뮬레이션 및 워크플로우 (Simulation & Workflow)
/** 워크플로우 데이터 [cite: 43, 45] */
export interface Workflow {
  uid: string;            // (DB 추가 요청 필요) 
  greenhouse_uid: string; // 적용 대상 하우스 
  name: string;           // 
  flow_data: object;      // 프론트 전용 JSONB 
  rule_data: object;      // 백엔드 전용 JSONB 
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'; // 
}

export interface WorkflowDeploy {
  uid: string;            // 배포 이력 식별자
  action: 'DEPLOY' | 'STOP' | 'RESTART'; // 
  snapshot: object;       // 배포 시점 로직 
  deployed_at: string;    // 
}

📅 5. 스케줄러 및 템플릿 (Scheduler & Template)
/** 일정 및 샘플 템플릿 [cite: 47, 51] */
export interface Schedule {
  uid: string;            // (DB 추가 요청 필요) 
  workflow_uid: string;   // 대상 워크플로우 
  start_time: string;     // HH:mm 
  end_time: string;       // HH:mm 
  days_of_week: string;   // 
  status: 'ACTIVE' | 'INACTIVE'; // 
}

export interface Template {
  uid: string;            // (DB 추가 요청 필요) [cite: 51]
  name: string;           // [cite: 51]
  crop_type: string;      // [cite: 51]
  flow_data: object;      // [cite: 51]
  rule_data: object;      // [cite: 51]
}

---

