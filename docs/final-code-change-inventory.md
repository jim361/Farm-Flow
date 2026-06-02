# Farm Flow 최종 코드 변경 인벤토리

## 1. 비교 기준

- 비교 기준 브랜치: `archive/main-before-farmflow-final-20260602`
- 최종 기준 커밋: 현재 GitHub `main`
- 실행 기준 소스:
  - 백엔드: `backend/`
  - 프론트엔드: `frontend/`
  - 배포/시연 도구: `tools/`
- 참고:
  - 병합 과정에서 루트 `src/`에도 백엔드 소스가 포함되어 있으나, 실제 자동 실행과 시연 기준은 `backend/` 프로젝트다.
  - 따라서 팀원 코드와 비교할 때는 `backend/src/main/java`, `frontend/src`, `tools`를 우선 비교 대상으로 보는 것이 좋다.

## 2. 코드 변경 형식 요약

| 영역 | 기존 형식 | 최종 형식 |
| --- | --- | --- |
| 인증 | 화면 중심 로그인/회원가입, 백엔드 연동 불안정 | Spring Security + JWT + 사용자 엔티티 + Redis 세션 기반 인증 |
| 사용자 구분 | 고정 또는 불명확한 온실 식별 | 사용자별 `greenhouseUid` 생성 및 API/장치/센서 데이터에 전달 |
| 장치 데이터 | 장치 등록과 센서 시뮬레이션 분리 | `greenhouseUid`, `deviceUid`, `deviceType` 기반으로 장치 등록과 MQTT 데이터 연결 |
| MQTT | 브로커/토픽 처리 구조 부족 | `MqttConfig`, `MqttPipeline`, telemetry/command DTO 기반 처리 |
| 룰 엔진 | 독립 규칙 또는 고정 조건 중심 | 로직빌더 flowData를 해석해 센서 조건과 제어기 ON/OFF 명령을 처리 |
| 템플릿 | 정적 카드 또는 빈 flowData | 실제 노드/엣지 flowData를 가진 템플릿, 편집/저장/삭제 흐름 |
| 스케줄러 | 단일 시간 중심 | 시작일~종료일 기간 기반 일정과 타임라인 표시 |
| 대시보드 | 정적/모의 데이터 중심 | MQTT 센서 값, 제어 상태, 알림 상태 반영 |
| 배포 | 로컬 개발 서버 중심 | Cloudflare Tunnel + Node public server + 자동 시작 스크립트 |

## 3. 백엔드 코드 변경 파일

### 3.1 인증, 보안, 사용자 관리

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `backend/src/main/java/com/backend/config/SecurityConfig.java` | 추가 | Spring Security 설정, JWT 필터, CORS, 인증 예외 경로 설정 |
| `backend/src/main/java/com/backend/security/JwtUtil.java` | 추가 | JWT 생성/검증 유틸리티 추가 |
| `backend/src/main/java/com/backend/security/JwtFilter.java` | 추가 | 요청의 Bearer token을 읽어 인증 컨텍스트 구성 |
| `backend/src/main/java/com/backend/security/CustomUserDetails.java` | 추가 | User 엔티티를 Spring Security 사용자 객체로 변환 |
| `backend/src/main/java/com/backend/security/CustomUserDetailsService.java` | 추가 | UID 기반 사용자 로딩 |
| `backend/src/main/java/com/backend/controller/AuthController.java` | 추가 | 회원가입, 로그인, 사용자 조회, 아이디/비밀번호 찾기, 비밀번호 변경 API |
| `backend/src/main/java/com/backend/service/AuthService.java` | 추가 | 회원가입 검증, 비밀번호 해시, JWT 발급, Redis 세션 저장 |
| `backend/src/main/java/com/backend/entity/User.java` | 추가 | 사용자 테이블 엔티티. `uid`, `email`, `passwordHash`, `name`, `greenhouseUid`, `role` 포함 |
| `backend/src/main/java/com/backend/repository/UserRepository.java` | 추가 | 사용자 이메일/UID/이름 검색 |
| `backend/src/main/java/com/backend/dto/LoginRequest.java` | 추가 | 로그인 요청 DTO |
| `backend/src/main/java/com/backend/dto/SignupRequest.java` | 추가 | 회원가입 요청 DTO |
| `backend/src/main/java/com/backend/dto/AuthResponse.java` | 추가 | 로그인/회원가입 응답 DTO. token과 greenhouseUid 전달 |
| `backend/src/main/java/com/backend/dto/UserResponse.java` | 추가 | 현재 사용자 정보 응답 DTO |

### 3.2 장치 등록과 온실 UID 분리

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `backend/src/main/java/com/backend/entity/Device.java` | 수정 | 장치 UID, 온실 UID, 타입, 상태 등 시연 연동 필드 확장 |
| `backend/src/main/java/com/backend/dto/DeviceRequest.java` | 수정 | 장치 등록 시 deviceUid, greenhouseUid, type 등을 받을 수 있게 확장 |
| `backend/src/main/java/com/backend/dto/DeviceResponse.java` | 수정 | 프론트 로직빌더/장치 목록에서 필요한 장치 식별 정보 반환 |
| `backend/src/main/java/com/backend/controller/DeviceController.java` | 수정 | 인증 사용자 기준 장치 등록/조회/삭제 흐름 보강 |
| `backend/src/main/java/com/backend/service/DeviceService.java` | 수정 | 온실 UID 기준 장치 관리, 중복 UID 처리, MQTT 데이터와 장치 연결 |
| `backend/src/main/java/com/backend/repository/DeviceRepository.java` | 수정 | greenhouseUid, deviceUid 기반 조회 메서드 추가 |
| `backend/src/main/java/com/backend/util/IdGenerator.java` | 수정 | 사용자 UID, 장치 UID, 온실 UID 생성 규칙 확장 |

### 3.3 MQTT와 센서 데이터 처리

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `backend/src/main/java/com/backend/mqtt/MqttConfig.java` | 추가 | MQTT broker 연결, inbound topic 구독, outbound command 발행 설정 |
| `backend/src/main/java/com/backend/mqtt/MqttPipeline.java` | 추가 | MQTT telemetry 메시지 파싱, 센서 상태 갱신, 룰 엔진 호출, command 발행 |
| `backend/src/main/java/com/backend/dto/MqttTelemetryMessage.java` | 추가 | 시뮬레이터가 보내는 센서 telemetry 메시지 구조 |
| `backend/src/main/java/com/backend/dto/MqttCommandMessage.java` | 추가 | 제어기 ON/OFF 명령 메시지 구조 |
| `backend/src/main/java/com/backend/sensor/SensorData.java` | 추가 | 센서 데이터 모델 |
| `backend/src/main/java/com/backend/sensor/ControlCommand.java` | 추가 | 제어기 명령 모델 |
| `backend/src/main/java/com/backend/sensor/SunriseSunsetCalculator.java` | 추가 | 조도/일출일몰 기반 규칙 보조 계산 |
| `backend/mosquitto/mosquitto.conf` | 추가 | Mosquitto MQTT 브로커 설정 |
| `backend/src/main/resources/application.properties` | 수정 | DB/Redis/MQTT 기본 접속 주소를 로컬 실행 기준으로 정리 |

### 3.4 룰 엔진과 자동 제어

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `backend/src/main/java/com/backend/rule/FarmRuleEngine.java` | 추가 | 워크플로우 조건을 평가하고 제어 명령을 생성하는 중심 엔진 |
| `backend/src/main/java/com/backend/rule/rules/TemperatureRule.java` | 추가 | 온도 조건 평가 |
| `backend/src/main/java/com/backend/rule/rules/HumidityRule.java` | 추가 | 습도 조건 평가 |
| `backend/src/main/java/com/backend/rule/rules/Co2Rule.java` | 추가 | CO2 조건 평가 |
| `backend/src/main/java/com/backend/rule/rules/LightRule.java` | 추가 | 조도 조건 평가 |

### 3.5 워크플로우와 템플릿

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `backend/src/main/java/com/backend/entity/Workflow.java` | 수정 | flowData, 상태, 사용자/온실 기준 저장 구조 보강 |
| `backend/src/main/java/com/backend/entity/WorkflowDeploy.java` | 추가 | 워크플로우 배포/활성화 상태 엔티티 |
| `backend/src/main/java/com/backend/entity/WorkflowStatus.java` | 수정 | 워크플로우 상태값 확장 |
| `backend/src/main/java/com/backend/entity/Template.java` | 수정 | 템플릿 flowData와 분류 데이터 보강 |
| `backend/src/main/java/com/backend/controller/WorkflowController.java` | 수정 | 워크플로우 저장, 수정, 삭제, 배포 API 확장 |
| `backend/src/main/java/com/backend/service/WorkflowService.java` | 수정 | flowData 저장, 배포 상태, 온실 기준 조회 처리 |
| `backend/src/main/java/com/backend/repository/WorkflowRepository.java` | 수정 | 사용자/온실/상태 기준 조회 추가 |
| `backend/src/main/java/com/backend/repository/WorkflowDeployRepository.java` | 추가 | 배포 상태 저장소 |
| `backend/src/main/java/com/backend/dto/WorkflowRequest.java` | 수정 | flowData와 상태 관련 요청 필드 확장 |
| `backend/src/main/java/com/backend/dto/WorkflowResponse.java` | 수정 | 프론트 로직빌더가 재구성할 수 있는 응답 데이터 확장 |
| `backend/src/main/java/com/backend/controller/TemplateController.java` | 수정 | 템플릿 적용/조회 흐름 보강 |
| `backend/src/main/java/com/backend/service/TemplateService.java` | 수정 | 템플릿 flowData 복사 및 워크플로우 생성 흐름 |
| `backend/src/main/java/com/backend/repository/TemplateRepository.java` | 수정 | 카테고리/식물 기준 조회 보강 |
| `backend/src/main/java/com/backend/dto/TemplateApplyRequest.java` | 추가 | 템플릿 적용 요청 DTO |
| `backend/src/main/java/com/backend/dto/TemplateResponse.java` | 수정 | 템플릿 화면과 로직빌더가 필요한 응답 필드 확장 |

### 3.6 대시보드, 시뮬레이션, 트레이싱

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `backend/src/main/java/com/backend/controller/DashboardController.java` | 추가 | 대시보드용 센서/장치 상태 조회 API 구조 |
| `backend/src/main/java/com/backend/simulation/SimulationController.java` | 추가 | 시뮬레이션 요청 API |
| `backend/src/main/java/com/backend/simulation/SimulationService.java` | 추가 | 가상 센서 조건 평가 흐름 |
| `backend/src/main/java/com/backend/simulation/SimulationRequest.java` | 추가 | 시뮬레이션 요청 DTO |
| `backend/src/main/java/com/backend/simulation/SimulationResult.java` | 추가 | 시뮬레이션 결과 DTO |
| `backend/src/main/java/com/backend/tracing/TraceEvent.java` | 추가 | 워크플로우 실행 추적 이벤트 모델 |
| `backend/src/main/java/com/backend/tracing/TracingService.java` | 추가 | 추적 이벤트 발행 서비스 |
| `backend/src/main/java/com/backend/tracing/WebSocketConfig.java` | 추가 | 실행 상태를 프론트로 보낼 WebSocket 설정 |

### 3.7 백엔드 설정 및 DB

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `backend/build.gradle` | 수정 | Security, JWT, MQTT, Redis, WebSocket 등 백엔드 의존성 추가 |
| `backend/init.sql` | 수정 | 기존 백엔드 DB 초기화 SQL 보강 |
| `init.sql` | 추가 | 루트 실행 기준 DB 초기화 SQL 추가 |
| `backend/src/test/resources/application.properties` | 추가 | 테스트 실행용 설정 추가 |
| `docker-compose.yml` | 추가 | PostgreSQL, Redis, InfluxDB, Mosquitto 실행 구성 |
| `build.gradle`, `settings.gradle`, `gradlew`, `gradlew.bat` | 추가 | 루트 Gradle 실행 구조 추가 |

## 4. 프론트엔드 코드 변경 파일

### 4.1 앱 구조와 API 계층

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `frontend/src/App.tsx` | 수정 | 로그인 상태, 사용자 정보, 장치/워크플로우 fetch, 템플릿 적용, 라우팅 흐름 통합 |
| `frontend/src/api/api.ts` | 수정 | API base URL, authFetch, 토큰 저장, 사용자/장치/워크플로우/템플릿 API 호출 정리 |
| `frontend/src/main.tsx` | 수정 | 앱 초기화와 스타일 연결 보강 |
| `frontend/vite.config.ts` | 수정 | Cloudflare public server 배포 기준 API 경로 처리 |
| `frontend/package.json`, `frontend/package-lock.json` | 수정 | 프론트 의존성 및 빌드 설정 반영 |

### 4.2 인증 화면

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `frontend/src/page/Login.tsx` | 수정 | 백엔드 로그인 API와 token/greenhouseUid 저장 흐름 연결 |
| `frontend/src/page/Sign.tsx` | 수정 | 회원가입 입력값과 백엔드 signup 요청 구조 정리 |
| `frontend/src/page/FindId.tsx` | 수정 | 아이디 찾기 방식을 현재 로그인 구조에 맞게 변경 |
| `frontend/src/page/FindPw.tsx` | 수정 | 임시 비밀번호/비밀번호 찾기 흐름 정리 |
| `frontend/src/components/ProfileModal.tsx` | 수정 | 사용자 정보 표시, 현재 비밀번호 확인, 비밀번호 변경 API 연결 |

### 4.3 레이아웃과 공통 UI

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `frontend/src/components/Layout.tsx` | 수정 | 사용자/온실 UID 표시, 알림센터, 사이드 영역 상태 관리 |
| `frontend/src/components/Sidebar.tsx` | 수정 | 메뉴 구조와 상태 표시 개선 |
| `frontend/src/components/DeploymentSafetyModal.tsx` | 수정 | 배포/적용 전 확인 UI 보강 |
| `frontend/src/components/AppHeader.css` | 수정 | 헤더 스타일 조정 |
| `frontend/src/index.css` | 수정 | 전체 디자인 톤, 카드/폼/템플릿/로직빌더/스케줄러 스타일 대폭 수정 |

### 4.4 대시보드

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `frontend/src/page/Dashboard.tsx` | 수정 | 센서 지표, 제어 상태, 알림 상태가 반영되도록 대시보드 흐름 개선 |
| `frontend/src/components/Dashboard/MetricsSection.tsx` | 수정 | 온도/습도/CO2/조도 카드 표시 개선 |
| `frontend/src/components/Dashboard/WeatherSection.tsx` | 수정 | 날씨/환경 정보 UI 개선 |

### 4.5 장치 등록

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `frontend/src/page/DeviceRegistrationPage.tsx` | 수정 | 센서와 제어기 등록, UID 입력, 시뮬레이터 장치명과 연결되는 등록 흐름 개선 |

### 4.6 로직빌더

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `frontend/src/page/LogicBuilderPage.tsx` | 수정 | 센서, 조건, 제어기 블록 구조. 조건값 직접 입력. 제어기 ON/OFF 설정 |
| `frontend/src/flow/logicNodes.tsx` | 수정 | React Flow 노드 타입과 표시 구조 개선 |

### 4.7 템플릿

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `frontend/src/page/TemplatePage.tsx` | 수정 | 기본 템플릿 flowData 채움, 카테고리 UI 개선, 편집/적용/삭제 흐름 보강 |

### 4.8 스케줄러

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `frontend/src/page/Scheduler.tsx` | 수정 | 기간 기반 일정과 타임라인 표시 흐름 개선 |
| `frontend/src/components/Scheduler/AddScheduleModal.tsx` | 수정 | 시작일/종료일과 시간 입력 구조 보강 |
| `frontend/src/components/Scheduler/EventModal.tsx` | 수정 | 일정 상세/수정 UI 정리 |
| `frontend/src/components/Scheduler/SchedulerData.ts` | 수정 | 일정 데이터 모델과 샘플 데이터 조정 |
| `frontend/src/components/Scheduler/mockSchedulerDb.ts` | 수정 | 시연용 일정 데이터 보강 |
| `frontend/src/components/Scheduler/types.ts` | 수정 | 기간 기반 일정 타입 확장 |
| `frontend/src/components/Scheduler/useSchedulerLogic.ts` | 수정 | 일정 생성/수정/삭제와 타임라인 반영 로직 개선 |

## 5. 배포와 시연 도구 코드 변경 파일

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `tools/mqtt-sensor-simulator.html` | 추가 | 브라우저 기반 MQTT 센서/제어기 시뮬레이터. 온실 UID와 장치 UID 입력 후 telemetry 발행 |
| `tools/farmflow-cloudflare-server.js` | 추가 | 프론트 정적 파일 제공, `/api/*` 백엔드 프록시, `/mqtt` WebSocket 프록시, `/__health` 제공 |
| `tools/start-farmflow.ps1` | 추가/수정 | Docker, 백엔드, public server, cloudflared 자동 시작. Cloudflare DNS/API 대기 및 3회 재시도 |
| `tools/register-farmflow-autostart.ps1` | 추가 | Windows 작업 스케줄러에 자동 시작 작업 등록 |
| `backend/mosquitto/mosquitto.conf` | 추가 | MQTT TCP 1883, WebSocket 9001 listener 설정 |
| `docker-compose.yml` | 추가 | DB/Redis/InfluxDB/MQTT 컨테이너 구성 |

## 6. 문서 파일

| 파일 | 상태 | 변경 내용 |
| --- | --- | --- |
| `HANDOFF.md` | 추가 | 작업 인수인계 요약 |
| `docs/broker-branch-handoff.md` | 추가 | 브로커 브랜치와 MQTT 연동 상황 정리 |
| `docs/mqtt-demo-setup.md` | 추가 | MQTT 시연 환경 구성 문서 |
| `docs/final-update-summary.md` | 추가 | 발표자료용 기능 변경 요약 |
| `docs/final-code-change-inventory.md` | 추가 | 파일 단위 코드 변경 인벤토리 |

## 7. 팀원 코드와 비교할 때 볼 순서

1. `frontend/src/page/LogicBuilderPage.tsx`
   - 로직빌더 요구사항이 가장 크게 바뀐 파일이다.
   - 센서/조건/제어기 블록 분리, 조건값 입력, ON/OFF 제어 설정을 확인한다.

2. `frontend/src/page/TemplatePage.tsx`
   - 기존 템플릿 화면과 가장 크게 달라진 파일이다.
   - 기본 템플릿 flowData, 편집/적용/삭제 흐름을 비교한다.

3. `frontend/src/page/DeviceRegistrationPage.tsx`
   - 장치 등록과 시뮬레이터 장치 UID 연결 흐름을 확인한다.

4. `backend/src/main/java/com/backend/mqtt/MqttPipeline.java`
   - MQTT telemetry가 들어와서 센서 상태, 룰 엔진, 제어 명령으로 이어지는 핵심 파일이다.

5. `backend/src/main/java/com/backend/rule/FarmRuleEngine.java`
   - 조건 판단과 제어 명령 생성 로직을 확인한다.

6. `backend/src/main/java/com/backend/service/AuthService.java`
   - 사용자 생성, greenhouseUid 발급, JWT 발급 흐름을 확인한다.

7. `backend/src/main/java/com/backend/service/DeviceService.java`
   - 사용자별 온실 UID와 장치 등록/조회 분리를 확인한다.

8. `tools/mqtt-sensor-simulator.html`
   - 실제 센서 없이 시연할 수 있게 만든 핵심 도구다.

9. `tools/farmflow-cloudflare-server.js`, `tools/start-farmflow.ps1`
   - 외부 도메인 배포와 자동 실행 구조를 확인한다.

## 8. 전체 코드 변경 파일 수

- 실행 기준 코드 변경 파일: 89개
  - 백엔드 Java/config: 58개
  - 프론트 React/TypeScript/CSS: 27개
  - 시연/배포 도구: 4개
- 전체 저장소 변경 파일: 164개
  - 루트 Gradle 구조와 병합된 보조 `src/` 소스까지 포함한 수치다.

