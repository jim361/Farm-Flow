import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Activity,
  Cloud,
  Droplets,
  Fan,
  Flame,
  Gauge,
  Wind,
  Settings,
} from "lucide-react";
import type { LibraryDevice } from "../App";
 
type SensorKind = "temp" | "humidity" | "co2";
type ControllerKind = "boiler" | "vent" | "pump";
type DeviceStatus = "ACTIVE" | "INACTIVE" | "ERROR";
 
/** 백엔드에서 내려오는 기기 정보 */
type RegisteredDevice = {
  id: number;
  uid: string;
  name: string;
  deviceType: "SENSOR" | "ACTUATOR";
  sensorType?: string | null;
  actuatorType?: string | null;
  status: DeviceStatus;
};
 
type DeviceRegistrationPageProps = {
  onRegisterDevice: (device: LibraryDevice) => void;
};
 
/* ── 아이콘 매핑 헬퍼 ── */
const sensorIcon = (t?: string | null, size = 20) => {
  switch (t?.toUpperCase()) {
    case "TEMP": return <Gauge size={size} />;
    case "HUMIDITY": return <Droplets size={size} />;
    case "CO2": return <Cloud size={size} />;
    default: return <Gauge size={size} />;
  }
};
const actuatorIcon = (t?: string | null, size = 20) => {
  switch (t?.toUpperCase()) {
    case "BOILER": return <Flame size={size} />;
    case "VENT": return <Fan size={size} />;
    case "PUMP": return <Wind size={size} />;
    default: return <Settings size={size} />;
  }
};
const sensorLabel = (t?: string | null) => {
  switch (t?.toUpperCase()) {
    case "TEMP": return "온도 센서";
    case "HUMIDITY": return "습도 센서";
    case "CO2": return "CO₂ 센서";
    default: return "센서";
  }
};
const actuatorLabel = (t?: string | null) => {
  switch (t?.toUpperCase()) {
    case "BOILER": return "보일러";
    case "VENT": return "환풍기";
    case "PUMP": return "관수 펌프";
    default: return "제어기";
  }
};
 
const statusDot = (s: DeviceStatus) =>
  s === "ACTIVE" ? "dev-dot--on" : s === "ERROR" ? "dev-dot--err" : "dev-dot--off";
 
export function DeviceRegistrationPage({ onRegisterDevice }: DeviceRegistrationPageProps) {
  const [sensor, setSensor] = useState<SensorKind | null>(null);
  const [controller, setController] = useState<ControllerKind | null>(null);
  const [threshold, setThreshold] = useState(28);
  const [sensorName, setSensorName] = useState("");
  const [controllerName, setControllerName] = useState("");
 
  /* ── 등록된 기기 목록 ── */
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [selectedDeviceUid, setSelectedDeviceUid] = useState<string | null>(null);
 
  /** 기기 목록 조회 */
  const fetchRegisteredDevices = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/devices");
      setDevices(res.data);
    } catch (err) {
      console.error("기기 목록 조회 실패:", err);
    }
  }, []);
 
  useEffect(() => {
    fetchRegisteredDevices();
  }, [fetchRegisteredDevices]);
 
  /** 기기 등록 */
  const handleSubmit = async () => {
    const sn = sensorName.trim();
    const cn = controllerName.trim();
 
    if (!sn && !cn) {
      alert("센서 또는 제어기 명칭을 입력해주세요.");
      return;
    }
 
    const deviceData = {
      uid: `DEV-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      greenhouseId: 1,
      name: sn || cn,
      deviceType: sn ? "SENSOR" : "ACTUATOR",
      sensorType: sn && sensor ? sensor.toUpperCase() : null,
      actuatorType: cn ? controller?.toUpperCase() : null,
      status: "ACTIVE",
    };
 
    try {
      const response = await axios.post("http://localhost:8080/api/v1/devices", deviceData);
 
      if (response.status === 200 || response.status === 201) {
        alert("장치가 성공적으로 등록되었습니다!");
 
        onRegisterDevice({
          id: response.data.id,
          name: response.data.name,
          deviceType: sn ? "SENSOR" : "ACTUATOR",
          subtype: sn ? (sensor ?? undefined) : (controller ?? undefined),
        });
 
        setSensorName("");
        setControllerName("");
        fetchRegisteredDevices();
      }
    } catch (error) {
      console.error("등록 중 에러 발생:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };
 
  /** 상태 변경 (바로 적용) */
  const handleStatusChange = async (newStatus: DeviceStatus) => {
    if (!selectedDeviceUid) {
      alert("상태를 변경할 장치를 먼저 선택하세요.");
      return;
    }
    // 프론트 상태 먼저 반영
    setDevices((prev) =>
      prev.map((d) => (d.uid === selectedDeviceUid ? { ...d, status: newStatus } : d))
    );
    // 백엔드 동기화 (API 없으면 무시)
    try {
      await axios.patch(
        `http://localhost:8080/api/v1/devices/${selectedDeviceUid}/status`,
        { status: newStatus }
      );
    } catch (err) {
      console.error("백엔드 상태 동기화 실패 (API 미구현):", err);
    }
  };
 
  const selectedDevice = devices.find((d) => d.uid === selectedDeviceUid);
 
  return (
    <>
      <div className="ff-page-head">
        <h1 className="ff-title">장치 등록</h1>
        <p className="ff-sub">
          센서와 제어기를 연결하고 임계값 기반 자동 제어 규칙을 설정합니다.
        </p>
      </div>
      <div className="dev-layout">
        {/* ── 왼쪽: 등록 폼 ── */}
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
                onClick={() => {
                  setSensor((prev) => (prev === type ? null : type));
                  setController(null);
                }}
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
                onClick={() => {
                  setController((prev) => (prev === type ? null : type));
                  setSensor(null);
                }}
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
            <p className="dev-logic-desc">센서 측정값이 설정치를 초과하면 연동된 제어기(환풍기 등)가 자동으로 가동됩니다.</p>
            <div className="dev-stepper">
              <button type="button" onClick={() => setThreshold((t) => t - 0.5)}>−</button>
              <output>{threshold.toFixed(1)} °C</output>
              <button type="button" onClick={() => setThreshold((t) => t + 0.5)}>+</button>
            </div>
          </div>
 
          <div className="dev-actions">
            <button type="button" className="dev-cancel">취소</button>
            <button type="button" className="dev-submit" onClick={handleSubmit}>등록하기</button>
          </div>
        </section>
 
        {/* ── 오른쪽: 보유 장치 상태 + 상태 변경 ── */}
        <aside className="dev-side">
          {/* 보유 장치 상태 (센서 + 제어기 통합) */}
          <div className="dev-widget">
            <div className="dev-widget-head"><Activity size={16} /> 보유 장치 현황</div>
            <p className="dev-widget-subtitle">보유 장치 상태</p>
 
            {devices.length === 0 && (
              <p className="dev-widget-empty">등록된 장치가 없습니다.</p>
            )}
 
            <div className="dev-device-list">
              {devices.map((d) => (
                <div
                  key={d.uid}
                  className={`dev-device-row ${selectedDeviceUid === d.uid ? "dev-device-row--selected" : ""}`}
                  onClick={() => setSelectedDeviceUid(d.uid === selectedDeviceUid ? null : d.uid)}
                >
                  <span className="dev-device-icon">
                    {d.deviceType === "SENSOR"
                      ? sensorIcon(d.sensorType)
                      : actuatorIcon(d.actuatorType)}
                  </span>
                  <div className="dev-device-info">
                    <span className="dev-device-kind">
                      {d.deviceType === "SENSOR" ? sensorLabel(d.sensorType) : actuatorLabel(d.actuatorType)}
                    </span>
                    <strong className="dev-device-name">{d.name}</strong>
                  </div>
                  <span className={`dev-dot ${statusDot(d.status)}`} />
                </div>
              ))}
            </div>
          </div>
 
          {/* 기기 상태 변경 */}
          <div className="dev-widget">
            <div className="dev-widget-head"><Settings size={16} /> 상태 모드 제어</div>
            <p className="dev-widget-subtitle">기기 상태 변경</p>
 
            {selectedDevice ? (
              <p className="dev-status-target">선택: <strong>{selectedDevice.name}</strong></p>
            ) : (
              <p className="dev-status-target dev-status-target--none">위 목록에서 장치를 선택하세요</p>
            )}
 
            <div className="dev-status-btns">
              <button
                type="button"
                className={`dev-status-btn dev-status-btn--active ${selectedDevice?.status === "ACTIVE" ? "dev-status-btn--current" : ""}`}
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={!selectedDeviceUid}
              >
                <span className="dev-dot dev-dot--on" />
                정상
              </button>
              <button
                type="button"
                className={`dev-status-btn dev-status-btn--inactive ${selectedDevice?.status === "INACTIVE" ? "dev-status-btn--current" : ""}`}
                onClick={() => handleStatusChange("INACTIVE")}
                disabled={!selectedDeviceUid}
              >
                <span className="dev-dot dev-dot--off" />
                비활성
              </button>
              <button
                type="button"
                className={`dev-status-btn dev-status-btn--error ${selectedDevice?.status === "ERROR" ? "dev-status-btn--current" : ""}`}
                onClick={() => handleStatusChange("ERROR")}
                disabled={!selectedDeviceUid}
              >
                <span className="dev-dot dev-dot--err" />
                오류
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}