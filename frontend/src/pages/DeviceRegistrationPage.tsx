import { useState } from "react";
import axios from "axios";
import {
  Activity,
  Cloud,
  Droplets,
  Fan,
  Flame,
  Gauge,
  ToggleLeft,
  Wind,
} from "lucide-react";
import type { LibraryDevice } from "../App";

type SensorKind = "temp" | "humidity" | "co2";
type ControllerKind = "boiler" | "vent" | "pump";

type DeviceRegistrationPageProps = {
  onRegisterDevice: (device: LibraryDevice) => void;
};

export function DeviceRegistrationPage({ onRegisterDevice }: DeviceRegistrationPageProps) {
  const [sensor, setSensor] = useState<SensorKind>("temp");
  const [controller, setController] = useState<ControllerKind | null>(null);
  const [threshold, setThreshold] = useState(28);
  const [sensorName, setSensorName] = useState("");
  const [controllerName, setControllerName] = useState("");

  const handleSubmit = async () => {
    const sn = sensorName.trim();
    const cn = controllerName.trim();

    if (!sn && !cn) {
      alert("센서 또는 제어기 명칭을 입력해주세요.");
      return;
    }

    // 백엔드 Device.java 및 init.sql 구조에 맞춘 데이터 구성
    const deviceData = {
      uid: `DEV-${Math.random().toString(36).substring(2, 11).toUpperCase()}`, // 중복 방지 UID 생성
      greenhouseId: 1, // 기본 온실 ID (init.sql의 첫 번째 하우스)
      name: sn || cn,
      deviceType: sn ? "SENSOR" : "ACTUATOR",
      sensorType: sn ? sensor.toUpperCase() : null,
      actuatorType: cn ? controller?.toUpperCase() : null,
      status: "ACTIVE"
    };

    try {
      // 백엔드 API 호출 (엔드포인트는 프로젝트 설정에 따라 확인 필요)
      const response = await axios.post("http://localhost:8080/api/v1/devices", deviceData);

      if (response.status === 200 || response.status === 201) {
        alert("장치가 성공적으로 등록되었습니다!");

        // 부모 컴포넌트의 상태 업데이트
        onRegisterDevice({
          id: response.data.id,
          name: response.data.name,
          group: sn ? "sensor" : "action",
          subtype: sn ? sensor : (controller || "boiler"),
        });
        
        setSensorName("");
        setControllerName("");
      }
    } catch (error) {
      console.error("등록 중 에러 발생:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <>
      <div className="ff-page-head">
        <h1 className="ff-title">장치 등록</h1>
        <p className="ff-sub">
          센서와 제어기를 연결하고 임계값 기반 자동 제어 규칙을 설정합니다.
        </p>
      </div>
      <div className="dev-layout">
        <section className="dev-panel">
          <div className="dev-row-2">
            <div className="dev-field">
              <label htmlFor="sn">센서 명칭</label>
              <input
                id="sn"
                placeholder="예: 온실 A구역 온도 센서"
                value={sensorName}
                onChange={(e) => setSensorName(e.target.value)}
              />
            </div>
            <div className="dev-field">
              <label htmlFor="cn">제어기 명칭</label>
              <input
                id="cn"
                placeholder="예: 구역 1 메인 보일러"
                value={controllerName}
                onChange={(e) => setControllerName(e.target.value)}
              />
            </div>
          </div>

          <h3 className="dev-section-title">센서 유형 선택</h3>
          <div className="dev-cards">
            {(["temp", "humidity", "co2"] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`dev-type-card ${sensor === type ? "dev-type-card--on" : ""}`}
                onClick={() => setSensor(type)}
              >
                {type === "temp" && <Gauge size={28} />}
                {type === "humidity" && <Droplets size={28} />}
                {type === "co2" && <Cloud size={28} />}
                <span>{type === "temp" ? "온도" : type === "humidity" ? "습도" : "CO₂"} 센서</span>
              </button>
            ))}
          </div>

          <h3 className="dev-section-title">제어기 유형 선택</h3>
          <div className="dev-cards">
            {(["boiler", "vent", "pump"] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`dev-type-card ${controller === type ? "dev-type-card--on" : ""}`}
                onClick={() => setController(type)}
              >
                {type === "boiler" && <Flame size={28} />}
                {type === "vent" && <Fan size={28} />}
                {type === "pump" && <Wind size={28} />}
                <span>{type === "boiler" ? "보일러" : type === "vent" ? "환풍기" : "관수 펌프"}</span>
              </button>
            ))}
          </div>

          <div className="dev-logic-box">
            <span className="dev-badge">활성화됨</span>
            <h4>작동 시작 온도 (상한 임계값)</h4>
            <div className="dev-stepper">
              <button type="button" onClick={() => setThreshold(t => t - 0.5)}>−</button>
              <output>{threshold.toFixed(1)} °C</output>
              <button type="button" onClick={() => setThreshold(t => t + 0.5)}>+</button>
            </div>
          </div>

          <div className="dev-actions">
            <button type="button" className="dev-cancel">취소</button>
            <button type="button" className="dev-submit" onClick={handleSubmit}>등록하기</button>
          </div>
        </section>

        <aside className="dev-side">
          <div className="dev-widget">
            <div className="dev-widget-head"><Activity size={16} /> 실시간 현황</div>
            <p>보유 센서 상태</p>
            {[{ label: "온도", value: "24.5°C" }, { label: "습도", value: "65%" }].map((row) => (
              <div key={row.label} className="dev-widget-item">
                <span>{row.label} · <strong>{row.value}</strong></span>
                <span className="dev-dot dev-dot--on" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}