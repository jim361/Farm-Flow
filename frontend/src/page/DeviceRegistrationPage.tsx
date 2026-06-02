import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Cloud,
  Droplets,
  Fan,
  Flame,
  Gauge,
  Settings,
} from "lucide-react";
import type { LibraryDevice } from "../App";
import {
  API_BASE_URL,
  authFetch,
  getActiveGreenhouseUid,
  registerDeviceApi,
  updateDeviceStatusApi,
} from "../api/api";

type SensorKind = "temp" | "humidity" | "co2" | "light";
type ControllerKind = "fan" | "sprinkler" | "led";
type DeviceStatus = "ACTIVE" | "INACTIVE" | "ERROR";

type RegisteredDevice = {
  uid: string;
  name: string;
  deviceType: "SENSOR" | "ACTUATOR";
  sensorType?: string | null;
  actuatorType?: string | null;
  mqttTopic?: string | null;
  status: DeviceStatus;
};

type DeviceRegistrationPageProps = {
  onRegisterDevice: (device: LibraryDevice) => void;
};

const sensorApiType = (kind: SensorKind | null) => {
  switch (kind) {
    case "temp": return "temperature";
    case "humidity": return "humidity";
    case "co2": return "co2";
    case "light": return "light";
    default: return null;
  }
};

const controllerApiType = (kind: ControllerKind | null) => {
  switch (kind) {
    case "fan": return "fan";
    case "sprinkler": return "sprinkler";
    case "led": return "led";
    default: return null;
  }
};

const sensorIcon = (t?: string | null, size = 20) => {
  switch (t?.toUpperCase()) {
    case "TEMP":
    case "TEMPERATURE": return <Gauge size={size} />;
    case "HUMIDITY": return <Droplets size={size} />;
    case "CO2": return <Cloud size={size} />;
    case "LIGHT": return <Activity size={size} />;
    default: return <Gauge size={size} />;
  }
};

const actuatorIcon = (t?: string | null, size = 20) => {
  switch (t?.toUpperCase()) {
    case "FAN": return <Fan size={size} />;
    case "SPRINKLER": return <Droplets size={size} />;
    case "LED": return <Flame size={size} />;
    default: return <Settings size={size} />;
  }
};

const sensorLabel = (t?: string | null) => {
  switch (t?.toUpperCase()) {
    case "TEMP":
    case "TEMPERATURE": return "온도 센서";
    case "HUMIDITY": return "습도 센서";
    case "CO2": return "CO2 센서";
    case "LIGHT": return "조도 센서";
    default: return "센서";
  }
};

const actuatorLabel = (t?: string | null) => {
  switch (t?.toUpperCase()) {
    case "FAN": return "환기팬";
    case "SPRINKLER": return "스프링클러";
    case "LED": return "보광등";
    default: return "제어기";
  }
};

const statusDot = (s: DeviceStatus) =>
  s === "ACTIVE" ? "dev-dot--on" : s === "ERROR" ? "dev-dot--err" : "dev-dot--off";

const statusLabel = (s?: DeviceStatus) =>
  s === "ACTIVE" ? "정상" : s === "ERROR" ? "오류" : "비활성";

export function DeviceRegistrationPage({ onRegisterDevice }: DeviceRegistrationPageProps) {
  const greenhouseUid = getActiveGreenhouseUid();
  const [sensor, setSensor] = useState<SensorKind | null>(null);
  const [controller, setController] = useState<ControllerKind | null>(null);
  const [sensorName, setSensorName] = useState("");
  const [controllerName, setControllerName] = useState("");
  const [deviceUid, setDeviceUid] = useState("");
  const [mqttTopic, setMqttTopic] = useState("");
  const [devices, setDevices] = useState<RegisteredDevice[]>([]);
  const [selectedDeviceUid, setSelectedDeviceUid] = useState<string | null>(null);

  const selectedDevice = useMemo(
    () => devices.find((d) => d.uid === selectedDeviceUid),
    [devices, selectedDeviceUid],
  );

  const fetchRegisteredDevices = useCallback(async () => {
    try {
      const uid = getActiveGreenhouseUid();
      if (!uid) return;
      const res = await authFetch(`${API_BASE_URL}/greenhouses/${encodeURIComponent(uid)}/devices`);
      if (res.ok) {
        setDevices(await res.json());
      }
    } catch (err) {
      console.error("기기 목록 조회 실패:", err);
    }
  }, []);

  useEffect(() => {
    fetchRegisteredDevices();
  }, [fetchRegisteredDevices]);

  const resetForm = () => {
    setSensorName("");
    setControllerName("");
    setDeviceUid("");
    setMqttTopic("");
    setSensor(null);
    setController(null);
  };

  const handleSubmit = async () => {
    const sn = sensorName.trim();
    const cn = controllerName.trim();

    if (!sn && !cn) {
      alert("센서 또는 제어기 이름을 입력해주세요.");
      return;
    }
    if (sn && cn) {
      alert("센서와 제어기는 한 번에 하나씩 등록해주세요.");
      return;
    }
    if (sn && !sensor) {
      alert("센서 유형을 선택해주세요.");
      return;
    }
    if (cn && !controller) {
      alert("제어기 유형을 선택해주세요.");
      return;
    }

    const isSensor = sn.length > 0;
    const deviceData = {
      name: isSensor ? sn : cn,
      deviceType: isSensor ? "SENSOR" : "ACTUATOR",
      uid: deviceUid.trim() || null,
      sensorType: isSensor ? sensorApiType(sensor) : null,
      actuatorType: !isSensor ? controllerApiType(controller) : null,
      mqttTopic: mqttTopic.trim() || null,
    };

    try {
      const responseData = await registerDeviceApi(deviceData);
      alert("장치가 등록되었습니다.");

      onRegisterDevice({
        id: responseData.uid,
        name: responseData.name,
        deviceType: responseData.deviceType,
        subtype: responseData.sensorType || responseData.actuatorType || undefined,
        sensorType: responseData.sensorType || null,
        actuatorType: responseData.actuatorType || null,
        mqttTopic: responseData.mqttTopic || null,
        status: responseData.status || null,
      });

      resetForm();
      fetchRegisteredDevices();
    } catch (error: any) {
      console.error("장치 등록 실패:", error);
      alert(error.message || "서버 연결에 실패했습니다.");
    }
  };

  const handleStatusChange = async (newStatus: DeviceStatus) => {
    if (!selectedDeviceUid) {
      alert("상태를 변경할 장치를 먼저 선택하세요.");
      return;
    }

    setDevices((prev) =>
      prev.map((d) =>
        d.uid === selectedDeviceUid ? { ...d, status: newStatus } : d
      )
    );

    try {
      await updateDeviceStatusApi(selectedDeviceUid, newStatus);
    } catch (err) {
      console.error("백엔드 상태 동기화 실패:", err);
      fetchRegisteredDevices();
    }
  };

  return (
    <>
      <div className="ff-page-head">
        <h1 className="ff-title">장치 등록</h1>
        <p className="ff-sub">
          센서와 제어기를 직접 입력해 등록합니다. 시뮬레이터와 연결하려면 같은 장치 UID를 입력하세요.
        </p>
        <p className="ff-sub" style={{ marginTop: 4 }}>
          내 온실 UID: <strong>{greenhouseUid || "미설정"}</strong>
        </p>
      </div>

      <div className="dev-layout">
        <section className="dev-panel">
          <div className="dev-row-2">
            <div className="dev-field">
              <label htmlFor="sn">센서 이름</label>
              <input
                id="sn"
                placeholder="예: A동 온도 센서"
                value={sensorName}
                onChange={(e) => {
                  setSensorName(e.target.value);
                  if (e.target.value.trim()) setControllerName("");
                }}
              />
            </div>
            <div className="dev-field">
              <label htmlFor="cn">제어기 이름</label>
              <input
                id="cn"
                placeholder="예: A동 환기팬"
                value={controllerName}
                onChange={(e) => {
                  setControllerName(e.target.value);
                  if (e.target.value.trim()) setSensorName("");
                }}
              />
            </div>
          </div>

          <h3 className="dev-section-title">센서 유형 선택</h3>
          <div className="dev-cards">
            {(["temp", "humidity", "co2", "light"] as const).map((type) => (
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
                {type === "light" && <Activity size={28} />}
                <span>
                  {type === "temp" ? "온도" : type === "humidity" ? "습도" : type === "co2" ? "CO2" : "조도"} 센서
                </span>
              </button>
            ))}
          </div>

          <h3 className="dev-section-title">제어기 유형 선택</h3>
          <div className="dev-cards">
            {(["fan", "sprinkler", "led"] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`dev-type-card ${controller === type ? "dev-type-card--on" : ""}`}
                onClick={() => {
                  setController((prev) => (prev === type ? null : type));
                  setSensor(null);
                }}
              >
                {type === "fan" && <Fan size={28} />}
                {type === "sprinkler" && <Droplets size={28} />}
                {type === "led" && <Flame size={28} />}
                <span>
                  {type === "fan" ? "환기팬" : type === "sprinkler" ? "스프링클러" : "보광등"}
                </span>
              </button>
            ))}
          </div>

          <div className="dev-row-2">
            <div className="dev-field">
              <label htmlFor="device-uid">장치 UID</label>
              <input
                id="device-uid"
                placeholder="예: DEV-TEMP"
                value={deviceUid}
                onChange={(e) => setDeviceUid(e.target.value)}
              />
            </div>
            <div className="dev-field">
              <label htmlFor="mqtt-topic">MQTT 토픽</label>
              <input
                id="mqtt-topic"
                placeholder="비워두면 내 온실 UID 기준으로 자동 생성"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
              />
            </div>
          </div>

          <div className="dev-actions">
            <button type="button" className="dev-cancel" onClick={resetForm}>
              취소
            </button>
            <button type="button" className="dev-submit" onClick={handleSubmit}>
              등록하기
            </button>
          </div>
        </section>

        <aside className="dev-side">
          <div className="dev-widget">
            <div className="dev-widget-head"><Activity size={16} /> 보유 장치 현황</div>
            <p className="dev-widget-subtitle">현재 온실에 등록된 장치</p>

            {devices.length === 0 && (
              <p className="dev-widget-empty">등록된 장치가 없습니다.</p>
            )}

            <div className="dev-device-list">
              {devices.map((d) => (
                <div
                  key={`${d.uid}-${d.mqttTopic || d.name}`}
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
                      {d.deviceType === "SENSOR"
                        ? sensorLabel(d.sensorType)
                        : actuatorLabel(d.actuatorType)}
                    </span>
                    <strong className="dev-device-name">{d.name}</strong>
                  </div>
                  <span className={`dev-dot ${statusDot(d.status)}`} title={statusLabel(d.status)} />
                </div>
              ))}
            </div>
          </div>

          <div className="dev-widget">
            <div className="dev-widget-head"><Settings size={16} /> 상태 모드 제어</div>
            <p className="dev-widget-subtitle">선택한 장치의 상태 변경</p>

            {selectedDevice ? (
              <p className="dev-status-target">
                선택: <strong>{selectedDevice.name}</strong>
              </p>
            ) : (
              <p className="dev-status-target dev-status-target--none">
                목록에서 장치를 선택하세요.
              </p>
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
