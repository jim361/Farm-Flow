import { useState } from "react";
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
<<<<<<< HEAD
import type { LibraryDevice } from "../App";
=======
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f

type SensorKind = "temp" | "humidity" | "co2";
type ControllerKind = "boiler" | "vent" | "pump";

<<<<<<< HEAD
type DeviceRegistrationPageProps = {
  onRegisterDevice: (device: LibraryDevice) => void;
};

export function DeviceRegistrationPage({ onRegisterDevice }: DeviceRegistrationPageProps) {
  const [sensor, setSensor] = useState<SensorKind | null>(null);
  const [controller, setController] = useState<ControllerKind | null>(null);
  const [threshold, setThreshold] = useState(28);
  const [sensorName, setSensorName] = useState("");
  const [controllerName, setControllerName] = useState("");

  const sensorLabelMap: Record<SensorKind, string> = {
    temp: "온도 센서",
    humidity: "습도 센서",
    co2: "CO₂ 센서",
  };
  const controllerLabelMap: Record<ControllerKind, string> = {
    boiler: "보일러",
    vent: "환풍기",
    pump: "관수 펌프",
  };

  const handleRegister = () => {
    if (sensor && sensorName.trim()) {
      onRegisterDevice({
        id: `sensor-${sensor}-${Date.now()}`,
        name: `${sensorName.trim()} (${sensorLabelMap[sensor]})`,
        group: "sensor",
        subtype: sensor,
      });
      setSensorName("");
      return;
    }
    if (controller && controllerName.trim()) {
      onRegisterDevice({
        id: `action-${controller}-${Date.now() + 1}`,
        name: `${controllerName.trim()} (${controllerLabelMap[controller]})`,
        group: "action",
        subtype: controller,
      });
      setControllerName("");
    }
  };
=======
export function DeviceRegistrationPage() {
  const [sensor, setSensor] = useState<SensorKind>("temp");
  const [controller, setController] = useState<ControllerKind | null>(null);
  const [threshold, setThreshold] = useState(28);
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f

  return (
    <>
      <div className="ff-page-head">
        <h1 className="ff-title">장치 등록</h1>
        <p className="ff-sub">
<<<<<<< HEAD
          센서와 제어기를 등록하고 임계값 기반 자동 제어 규칙을 설정합니다.
=======
          센서와 제어기를 연결하고 임계값 기반 자동 제어 규칙을 설정합니다.
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
        </p>
      </div>
      <div className="dev-layout">
        <section className="dev-panel">
          <div className="dev-row-2">
            <div className="dev-field">
              <label htmlFor="sn">센서 명칭</label>
              <input
                id="sn"
<<<<<<< HEAD
                value={sensorName}
                onChange={(e) => setSensorName(e.target.value)}
=======
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
                placeholder="예: 온실 A구역 온도 센서"
                autoComplete="off"
              />
            </div>
            <div className="dev-field">
              <label htmlFor="cn">제어기 명칭</label>
              <input
                id="cn"
<<<<<<< HEAD
                value={controllerName}
                onChange={(e) => setControllerName(e.target.value)}
=======
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
                placeholder="예: 구역 1 메인 보일러"
                autoComplete="off"
              />
            </div>
          </div>

          <h3 className="dev-section-title">센서 유형 선택</h3>
          <div className="dev-cards">
            <button
              type="button"
              className={
                "dev-type-card" + (sensor === "temp" ? " dev-type-card--on" : "")
              }
<<<<<<< HEAD
              onClick={() =>
                setSensor((prev) => {
                  const next = prev === "temp" ? null : "temp";
                  if (next) setController(null);
                  return next;
                })
              }
=======
              onClick={() => setSensor("temp")}
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
            >
              <Gauge size={28} strokeWidth={1.75} />
              <span>온도 센서</span>
            </button>
            <button
              type="button"
              className={
                "dev-type-card" +
                (sensor === "humidity" ? " dev-type-card--on" : "")
              }
<<<<<<< HEAD
              onClick={() =>
                setSensor((prev) => {
                  const next = prev === "humidity" ? null : "humidity";
                  if (next) setController(null);
                  return next;
                })
              }
=======
              onClick={() => setSensor("humidity")}
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
            >
              <Droplets size={28} strokeWidth={1.75} />
              <span>습도 센서</span>
            </button>
            <button
              type="button"
              className={
                "dev-type-card" + (sensor === "co2" ? " dev-type-card--on" : "")
              }
<<<<<<< HEAD
              onClick={() =>
                setSensor((prev) => {
                  const next = prev === "co2" ? null : "co2";
                  if (next) setController(null);
                  return next;
                })
              }
=======
              onClick={() => setSensor("co2")}
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
            >
              <Cloud size={28} strokeWidth={1.75} />
              <span>CO₂ 센서</span>
            </button>
          </div>

          <h3 className="dev-section-title">제어기 유형 선택</h3>
          <div className="dev-cards">
            <button
              type="button"
              className={
                "dev-type-card" +
                (controller === "boiler" ? " dev-type-card--on" : "")
              }
<<<<<<< HEAD
              onClick={() =>
                setController((prev) => {
                  const next = prev === "boiler" ? null : "boiler";
                  if (next) setSensor(null);
                  return next;
                })
              }
=======
              onClick={() => setController("boiler")}
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
            >
              <Flame size={28} strokeWidth={1.75} />
              <span>보일러</span>
            </button>
            <button
              type="button"
              className={
                "dev-type-card" +
                (controller === "vent" ? " dev-type-card--on" : "")
              }
<<<<<<< HEAD
              onClick={() =>
                setController((prev) => {
                  const next = prev === "vent" ? null : "vent";
                  if (next) setSensor(null);
                  return next;
                })
              }
=======
              onClick={() => setController("vent")}
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
            >
              <Fan size={28} strokeWidth={1.75} />
              <span>환풍기</span>
            </button>
            <button
              type="button"
              className={
                "dev-type-card" +
                (controller === "pump" ? " dev-type-card--on" : "")
              }
<<<<<<< HEAD
              onClick={() =>
                setController((prev) => {
                  const next = prev === "pump" ? null : "pump";
                  if (next) setSensor(null);
                  return next;
                })
              }
=======
              onClick={() => setController("pump")}
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
            >
              <Wind size={28} strokeWidth={1.75} />
              <span>관수 펌프</span>
            </button>
          </div>

          <div className="dev-logic-box">
            <span className="dev-badge">활성화됨</span>
            <h4>작동 시작 온도 (상한 임계값)</h4>
            <p>
              센서 측정값이 설정치를 초과하면 연동된 제어기(환풍기 등)가 자동으로
              가동됩니다.
            </p>
            <div className="dev-stepper">
              <button
                type="button"
                aria-label="임계값 감소"
                onClick={() => setThreshold((v) => Math.round((v - 0.5) * 10) / 10)}
              >
                −
              </button>
              <output>
                {threshold.toFixed(1)} °C
              </output>
              <button
                type="button"
                aria-label="임계값 증가"
                onClick={() => setThreshold((v) => Math.round((v + 0.5) * 10) / 10)}
              >
                +
              </button>
            </div>
          </div>

          <div className="dev-actions">
            <button type="button" className="dev-cancel">
              취소
            </button>
<<<<<<< HEAD
            <button type="button" className="dev-submit" onClick={handleRegister}>
=======
            <button type="button" className="dev-submit">
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
              등록하기
            </button>
          </div>
        </section>

        <aside className="dev-side">
          <div className="dev-widget">
            <div className="dev-widget-head">
              <Activity size={16} />
              실시간 현황
            </div>
            <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: "0.9rem" }}>
              보유 센서 상태
            </p>
            {[
              { label: "온도", value: "24.5°C" },
              { label: "습도", value: "65%" },
              { label: "CO₂", value: "420 ppm" },
            ].map((row) => (
              <div key={row.label} className="dev-widget-item">
                <span>
                  {row.label} · <strong>{row.value}</strong>
                </span>
                <span className="dev-dot dev-dot--on" />
              </div>
            ))}
          </div>
          <div className="dev-widget">
            <div className="dev-widget-head">
              <ToggleLeft size={16} />
              장치 제어 현황
            </div>
            <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: "0.9rem" }}>
              보유 제어기 상태
            </p>
            {[
              { label: "보일러", on: false },
              { label: "환풍기", on: true },
              { label: "펌프", on: false },
            ].map((row) => (
              <div
                key={row.label}
                className={
                  "dev-widget-item" + (row.on ? " dev-widget-item--active" : "")
                }
              >
                <span>
                  {row.label}{" "}
                  <strong>({row.on ? "ON" : "OFF"})</strong>
                </span>
                <span className={"dev-dot" + (row.on ? " dev-dot--on" : "")} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
