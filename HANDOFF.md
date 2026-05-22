# Farm Flow Test Handoff

이 문서는 `Farm-Flow-Test` 폴더를 Docker/DB가 떠 있는 옆 PC로 옮긴 뒤 Codex에서 바로 이어가기 위한 인수인계 메모입니다.

## 현재 폴더와 브랜치

- 로컬 폴더: `C:\Users\user\Documents\Codex\2026-05-22\jim361-farm-flow-https-github-com\Farm-Flow-Test`
- GitHub 원본: `https://github.com/jim361/Farm-Flow`
- 현재 브랜치: `local-all-branches-merged`
- 작업트리 상태: clean

## 지금까지 한 일

`main` 기준으로 새 통합 브랜치 `local-all-branches-merged`를 만들고 아래 브랜치들을 병합했다.

- `origin/su`
- `origin/k_jy`
- `origin/ksz`
- `origin/SinSik`
- `origin/DB`
- `origin/develop`
- `origin/kjy`
- `origin/master` (`--allow-unrelated-histories` 사용)

병합 중 충돌은 정리했고, 주요 기준은 다음과 같다.

- `k_jy`: `ProfileModal.tsx`는 API 기반 사용자 조회/로그아웃/비밀번호 변경 로직을 살림
- `ksz`: 로그인/회원가입 라우트가 `App.tsx`에서 사용 중이라 `Login.tsx`, `Sign.tsx`는 보존
- `SinSik`: MQTT, Rule Engine, Simulation, Tracing 신규 파일은 포함하되 기존 통합 앱 구조를 유지
- `master`: 히스토리가 달라 add/add 충돌이 많아 현재 통합본 기준으로 유지

추가로 빌드 정합성을 맞추기 위해 다음 수정도 했다.

- `backend/build.gradle`에 MQTT, WebSocket, Easy Rules, H2 test dependency 추가
- `backend/src/test/resources/application.properties` 추가
- `FarmRuleEngine.java`의 Easy Rules import 수정
- `frontend/src/App.tsx`, `frontend/src/components/Layout.tsx` 빌드 오류 정리

## 검증 완료 내역

통합 직후 아래 검증은 통과했다.

```powershell
npm run build --prefix frontend
```

결과: 성공

```powershell
cd backend
.\gradlew.bat test
```

결과: 성공

참고: 백엔드 테스트 중 MQTT 브로커가 없으면 종료 시점에 MQTT unsubscribe 로그가 찍힐 수 있지만, 당시 Gradle 결과는 `BUILD SUCCESSFUL`이었다.

## 주요 커밋

최근 중요한 커밋:

- `397f285` Add missing test configuration values
- `4894864` Stabilize merged build checks
- `6aa41d3` Fix merged frontend and rule engine build issues
- `26f6888` Add backend dependencies for merged MQTT features
- `21449ba` Merge remote-tracking branch `origin/master`
- `7496c4b` Merge remote-tracking branch `origin/SinSik`
- `9a3d4b9` Merge remote-tracking branch `origin/ksz`
- `be12b00` Merge remote-tracking branch `origin/k_jy`
- `07125a4` Point backend services to remote Docker host

## 옆 PC Docker 상태

옆 PC에서 확인된 컨테이너:

```text
farmflow-postgres   postgres:16          0.0.0.0:5432->5432/tcp
farmflow-redis      redis:7-alpine       0.0.0.0:6379->6379/tcp
farmflow-influxdb   influxdb:2.7         0.0.0.0:8086->8086/tcp
farmflow-mqtt       eclipse-mosquitto:2  0.0.0.0:1883->1883/tcp
```

옆 PC IP:

```text
192.168.34.27
```

이 PC에서 포트 연결은 확인됨:

- `192.168.34.27:5432` PostgreSQL 연결 성공
- `192.168.34.27:6379` Redis 연결 성공
- `192.168.34.27:1883` MQTT 연결 성공

하지만 이 PC에서 백엔드를 실행하면 PostgreSQL JDBC 인증 단계에서 `EOFException`이 발생해 `8080` 서버가 뜨지 않았다. DB 내부 접속은 옆 PC에서 정상 확인됨.

옆 PC에서 확인한 DB 상태:

```sql
\dt
SELECT current_user, current_database();
```

결과:

- `users`, `devices`, `workflows`, `templates` 등 11개 테이블 존재
- `current_user = farmflow`
- `current_database = farmflow`

## 중요한 설정

현재 `backend/src/main/resources/application.properties`는 옆 PC IP를 기본값으로 보도록 바뀌어 있다.

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://192.168.34.27:5432/farmflow?sslmode=disable&gssEncMode=disable}
spring.datasource.username=farmflow
spring.datasource.password=${DB_PASSWORD:farmflow1234}
spring.data.redis.host=${SPRING_DATA_REDIS_HOST:192.168.34.27}
spring.data.redis.port=${SPRING_DATA_REDIS_PORT:6379}
mqtt.broker.url=${MQTT_BROKER_URL:tcp://192.168.34.27:1883}
```

## 옆 PC로 옮겨서 실행할 때 추천

Docker가 떠 있는 옆 PC에서 실행할 거면 `localhost`로 바꾸는 것이 가장 단순하다.

`backend/src/main/resources/application.properties`를 다음처럼 바꾸는 것을 추천:

```properties
spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/farmflow?sslmode=disable&gssEncMode=disable}
spring.datasource.username=farmflow
spring.datasource.password=${DB_PASSWORD:farmflow1234}
spring.data.redis.host=${SPRING_DATA_REDIS_HOST:localhost}
spring.data.redis.port=${SPRING_DATA_REDIS_PORT:6379}
mqtt.broker.url=${MQTT_BROKER_URL:tcp://localhost:1883}
```

그 다음 옆 PC에서 실행:

```powershell
cd C:\path\to\Farm-Flow-Test\backend
.\gradlew.bat bootRun
```

백엔드가 뜨면 `http://localhost:8080` 사용.

프론트 실행:

```powershell
cd C:\path\to\Farm-Flow-Test\frontend
npm install
npm run dev
```

프론트가 백엔드 API를 어디로 호출하는지는 `frontend/src/api/api.ts`에서 확인해야 한다. 같은 PC에서 실행하면 보통 `http://localhost:8080`이면 된다.

## 회원가입 관련

회원가입은 백엔드가 PostgreSQL과 Redis에 정상 연결되어 `8080`으로 떠야 가능하다.

흐름:

```text
프론트 회원가입
-> 백엔드 /api/v1/auth/signup
-> PostgreSQL users 테이블 INSERT
-> Redis 세션/토큰 저장
```

따라서 옆 PC에서 백엔드를 먼저 정상 기동한 뒤 회원가입을 테스트해야 한다.

## 도메인 연결 방향

팀원에게 접속 URL을 주려면 DB 포트를 직접 공개하지 말고 프론트/백엔드만 공개하는 방향이 좋다.

권장 구조:

```text
도메인
-> Nginx 또는 프론트 서버
-> Spring Boot 백엔드 API
-> Docker 내부 PostgreSQL/Redis/MQTT/InfluxDB
```

DB 포트 `5432`를 팀원에게 직접 열어주는 방식은 비추천.

## 다음 Codex가 이어서 할 일

1. `Farm-Flow-Test`를 Docker가 떠 있는 옆 PC로 옮긴다.
2. Codex에서 이 `HANDOFF.md`를 먼저 읽는다.
3. `backend/src/main/resources/application.properties`를 `localhost` 기준으로 바꾼다.
4. `backend`에서 `.\gradlew.bat bootRun` 실행.
5. 백엔드가 정상 기동하면 `frontend`에서 `npm install`, `npm run dev` 실행.
6. 회원가입, 로그인, 장치 등록, 워크플로우 저장이 DB에 들어가는지 확인.
7. 팀원 공유가 필요하면 도메인/Nginx 구성으로 넘어간다.
