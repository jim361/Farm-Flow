import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Download, User as UserIcon } from "lucide-react";
import type { SavedUserWorkflow } from "../workflowTypes";
import { fetchTemplatesApi, applyTemplateApi, saveWorkflowApi, deployWorkflowApi, getActiveGreenhouseUid, type LibraryDevice, type TemplateItem } from "../api/api";
 
/* ── 지능형 환기 제어 프리셋 노드/엣지 ── */
const edgeStyle = {
  stroke: "#22c55e",
  strokeWidth: 2,
  strokeDasharray: "6 4",
};

const simulatorTopic = (greenhouseUid: string, deviceUid: string, suffix: "telemetry" | "command") =>
  greenhouseUid
    ? `farmflow/greenhouses/${greenhouseUid}/devices/${deviceUid}/${suffix}`
    : `farmflow/greenhouses/{온실UID}/devices/${deviceUid}/${suffix}`;
 
const ventilationNodes = [
  {
    id: "n1",
    type: "sensor",
    position: { x: 60, y: 140 },
    data: {
      name: "DEV-TEMP 온도 센서",
      label: "DEV-TEMP 온도 센서",
      deviceUid: "DEV-TEMP",
      sensorType: "temperature",
      value: "42.6°C",
      topic: simulatorTopic(getActiveGreenhouseUid(), "DEV-TEMP", "telemetry"),
    },
  },
  {
    id: "n2",
    type: "condition",
    position: { x: 360, y: 120 },
    data: { label: "온도 > 30°C", expression: "온도 > 30°C", metric: "temperature", operator: ">", threshold: 30 },
  },
  {
    id: "n3",
    type: "action",
    position: { x: 660, y: 140 },
    data: {
      name: "DEV-FAN 환기팬 ON",
      label: "DEV-FAN 환기팬 ON",
      headerLabel: "제어기",
      deviceUid: "DEV-FAN",
      command: "ON",
      commandTopic: simulatorTopic(getActiveGreenhouseUid(), "DEV-FAN", "command"),
    },
  },
];
 
const ventilationEdges = [
  { id: "e1", source: "n1", target: "n2", animated: true, style: edgeStyle },
  { id: "e2", source: "n2", target: "n3", animated: true, style: edgeStyle },
];
 
export { ventilationNodes, ventilationEdges };

function buildVentilationFlowData(devices: LibraryDevice[]) {
  const greenhouseUid = getActiveGreenhouseUid();
  const tempSensor = devices.find((d) =>
    d.deviceType === "SENSOR" &&
    ["temp", "temperature"].includes((d.sensorType || d.subtype || "").toLowerCase())
  );
  const fan = devices.find((d) =>
    d.deviceType === "ACTUATOR" &&
    ["vent", "fan"].includes((d.actuatorType || d.subtype || "").toLowerCase())
  );

  if (!tempSensor && !fan) {
    return JSON.stringify({ nodes: ventilationNodes, edges: ventilationEdges });
  }

  const nodes = [
    {
      ...ventilationNodes[0],
      data: {
        ...ventilationNodes[0].data,
        name: tempSensor?.name || ventilationNodes[0].data.name,
        label: tempSensor?.name || ventilationNodes[0].data.label,
        deviceUid: tempSensor?.id || ventilationNodes[0].data.deviceUid,
        sensorType: tempSensor?.sensorType || tempSensor?.subtype || ventilationNodes[0].data.sensorType,
        topic: tempSensor?.mqttTopic || (tempSensor ? simulatorTopic(greenhouseUid, tempSensor.id, "telemetry") : ventilationNodes[0].data.topic),
      },
    },
    ventilationNodes[1],
    {
      ...ventilationNodes[2],
      data: {
        ...ventilationNodes[2].data,
        name: fan?.name || ventilationNodes[2].data.name,
        label: fan?.name || ventilationNodes[2].data.label,
        deviceUid: fan?.id || ventilationNodes[2].data.deviceUid,
        commandTopic: fan?.mqttTopic?.includes("/command")
          ? fan.mqttTopic
          : fan
            ? simulatorTopic(greenhouseUid, fan.id, "command")
            : ventilationNodes[2].data.commandTopic,
      },
    },
  ];

  return JSON.stringify({ nodes, edges: ventilationEdges });
}

function withRegisteredDevices(templates: TemplateItem[], devices: LibraryDevice[]) {
  return templates.map((tpl) =>
    tpl.id === "builtin-v"
      ? { ...tpl, flowData: buildVentilationFlowData(devices) }
      : tpl
  );
}

type TemplateFlowConfig = {
  sensorUid: string;
  sensorName: string;
  sensorType: string;
  metric: "temperature" | "humidity" | "co2" | "light";
  unit: string;
  onExpression: string;
  onOperator: ">" | ">=" | "<" | "<=";
  onThreshold: number;
  offExpression: string;
  offOperator: ">" | ">=" | "<" | "<=";
  offThreshold: number;
  actuatorUid: string;
  actuatorName: string;
};

function buildTemplateFlowData(config: TemplateFlowConfig) {
  const greenhouseUid = getActiveGreenhouseUid();
  const sensorTopic = simulatorTopic(greenhouseUid, config.sensorUid, "telemetry");
  const commandTopic = simulatorTopic(greenhouseUid, config.actuatorUid, "command");
  const nodes = [
    {
      id: `${config.sensorUid}-sensor`,
      type: "sensor",
      position: { x: 40, y: 130 },
      data: {
        name: config.sensorName,
        label: config.sensorName,
        deviceUid: config.sensorUid,
        sensorType: config.sensorType,
        metric: config.metric,
        value: `기준 ${config.onThreshold}${config.unit}`,
        topic: sensorTopic,
      },
    },
    {
      id: `${config.sensorUid}-condition-on`,
      type: "condition",
      position: { x: 340, y: 60 },
      data: {
        label: config.onExpression,
        expression: config.onExpression,
        metric: config.metric,
        operator: config.onOperator,
        threshold: config.onThreshold,
      },
    },
    {
      id: `${config.actuatorUid}-on`,
      type: "action",
      position: { x: 650, y: 60 },
      data: {
        name: `${config.actuatorName} ON`,
        label: `${config.actuatorName} ON`,
        headerLabel: "제어기",
        deviceUid: config.actuatorUid,
        command: "ON",
        commandTopic,
      },
    },
    {
      id: `${config.sensorUid}-condition-off`,
      type: "condition",
      position: { x: 340, y: 220 },
      data: {
        label: config.offExpression,
        expression: config.offExpression,
        metric: config.metric,
        operator: config.offOperator,
        threshold: config.offThreshold,
      },
    },
    {
      id: `${config.actuatorUid}-off`,
      type: "action",
      position: { x: 650, y: 220 },
      data: {
        name: `${config.actuatorName} OFF`,
        label: `${config.actuatorName} OFF`,
        headerLabel: "제어기",
        deviceUid: config.actuatorUid,
        command: "OFF",
        commandTopic,
      },
    },
  ];

  const edges = [
    { id: `${config.sensorUid}-e1`, source: `${config.sensorUid}-sensor`, target: `${config.sensorUid}-condition-on`, animated: true, style: edgeStyle },
    { id: `${config.sensorUid}-e2`, source: `${config.sensorUid}-condition-on`, target: `${config.actuatorUid}-on`, animated: true, style: edgeStyle },
    { id: `${config.sensorUid}-e3`, source: `${config.sensorUid}-sensor`, target: `${config.sensorUid}-condition-off`, animated: true, style: edgeStyle },
    { id: `${config.sensorUid}-e4`, source: `${config.sensorUid}-condition-off`, target: `${config.actuatorUid}-off`, animated: true, style: edgeStyle },
  ];

  return JSON.stringify({ nodes, edges });
}
 
/* ── 백엔드 미연결 시 기본 제공 템플릿 ── */
const fallbackTemplates: TemplateItem[] = [
  {
    id: "builtin-a",
    name: "딸기 최적 기후 제어",
    description: "당도를 극대화하기 위한 냉온 관리 로직입니다. 주간 광합성 효율과 야간 호흡 억제를 자동으로 조절합니다.",
    cropType: "strawberry",
    flowData: buildTemplateFlowData({
      sensorUid: "DEV-TEMP",
      sensorName: "DEV-TEMP 온도 센서",
      sensorType: "temperature",
      metric: "temperature",
      unit: "°C",
      onExpression: "온도 > 26°C",
      onOperator: ">",
      onThreshold: 26,
      offExpression: "온도 <= 24°C",
      offOperator: "<=",
      offThreshold: 24,
      actuatorUid: "DEV-FAN",
      actuatorName: "DEV-FAN 환기팬",
    }),
    ruleData: "{}",
    scheduleData: "{}",
    author: "Farm Flow",
    downloadCnt: 0,
  },
  {
    id: "builtin-w",
    name: "토마토 수분 관리",
    description: "토양 수분 센서와 연동하여 정밀 관수를 실시합니다. 뿌리 발육을 촉진하고 과실 터짐 현상을 방지합니다.",
    cropType: "tomato",
    flowData: buildTemplateFlowData({
      sensorUid: "DEV-HUM",
      sensorName: "DEV-HUM 습도 센서",
      sensorType: "humidity",
      metric: "humidity",
      unit: "%",
      onExpression: "습도 < 60%",
      onOperator: "<",
      onThreshold: 60,
      offExpression: "습도 >= 68%",
      offOperator: ">=",
      offThreshold: 68,
      actuatorUid: "DEV-SPRINKLER",
      actuatorName: "DEV-SPRINKLER 스프링클러",
    }),
    ruleData: "{}",
    scheduleData: "{}",
    author: "Farm Flow",
    downloadCnt: 0,
  },
  {
    id: "builtin-g",
    name: "상추 성장 촉진",
    description: "LED 광량 제어와 CO2 시비를 통해 수확 주기를 20% 단축시키는 집약적 성장 촉진 알고리즘입니다.",
    cropType: "lettuce",
    flowData: buildTemplateFlowData({
      sensorUid: "DEV-LIGHT",
      sensorName: "DEV-LIGHT 조도 센서",
      sensorType: "light",
      metric: "light",
      unit: "lux",
      onExpression: "조도 < 12000lux",
      onOperator: "<",
      onThreshold: 12000,
      offExpression: "조도 >= 18000lux",
      offOperator: ">=",
      offThreshold: 18000,
      actuatorUid: "DEV-LED",
      actuatorName: "DEV-LED 보광등",
    }),
    ruleData: "{}",
    scheduleData: "{}",
    author: "Farm Flow",
    downloadCnt: 0,
  },
  {
    id: "builtin-s",
    name: "겨울철 보온 최적화",
    description: "난방 에너지 비용을 최소화하면서 야간 저온 피해를 방지하는 효율 중심의 보온 제어 로직입니다.",
    cropType: "",
    flowData: buildTemplateFlowData({
      sensorUid: "DEV-TEMP",
      sensorName: "DEV-TEMP 온도 센서",
      sensorType: "temperature",
      metric: "temperature",
      unit: "°C",
      onExpression: "온도 < 18°C",
      onOperator: "<",
      onThreshold: 18,
      offExpression: "온도 >= 21°C",
      offOperator: ">=",
      offThreshold: 21,
      actuatorUid: "DEV-LED",
      actuatorName: "DEV-LED 보광등",
    }),
    ruleData: "{}",
    scheduleData: "{}",
    author: "Farm Flow",
    downloadCnt: 0,
  },
  {
    id: "builtin-v",
    name: "지능형 환기 제어",
    description: "외부 풍속 및 온습도 데이터를 실시간 분석하여 창 개폐를 정밀 조절합니다. 급격한 내부 환경 변화를 억제합니다.",
    cropType: "",
    flowData: JSON.stringify({ nodes: ventilationNodes, edges: ventilationEdges }),
    ruleData: "{}",
    scheduleData: "{}",
    author: "Farm Flow",
    downloadCnt: 0,
  },
];
 
/* 작물 코드 → 한국어 */
const cropLabel: Record<string, string> = {
  strawberry: "딸기",
  tomato: "토마토",
  lettuce: "상추",
  "": "공통",
};
 
/* 카드 아이콘 배경색 */
const iconStyle: Record<string, { bg: string; tagColor: string; tagBg: string; tag: string }> = {
  "builtin-a": { bg: "#fee2e2", tagColor: "#b91c1c", tagBg: "#fecaca", tag: "PREMIUM" },
  "builtin-w": { bg: "#dbeafe", tagColor: "#1d4ed8", tagBg: "#bfdbfe", tag: "VERIFIED" },
  "builtin-g": { bg: "#dcfce7", tagColor: "#15803d", tagBg: "#bbf7d0", tag: "FAST GROWTH" },
  "builtin-s": { bg: "#ede9fe", tagColor: "#6d28d9", tagBg: "#ddd6fe", tag: "SEASONAL" },
  "builtin-v": { bg: "#ffedd5", tagColor: "#c2410c", tagBg: "#fed7aa", tag: "ESSENTIAL" },
};
 
const defaultIconStyle = { bg: "#f3f4f6", tagColor: "#374151", tagBg: "#e5e7eb", tag: "TEMPLATE" };
 
/* 필터 옵션 */
const CROP_FILTERS = [
  { value: "", label: "전체" },
  { value: "strawberry", label: "딸기" },
  { value: "tomato", label: "토마토" },
  { value: "lettuce", label: "상추" },
];
 
type TemplatePageProps = {
  userWorkflows: SavedUserWorkflow[];
  libraryDevices: LibraryDevice[];
  onDeleteWorkflow: (id: string) => void;
  onApplyUserWorkflow: (id: string) => void;
  onRefreshWorkflows: () => void;
};
 
export function TemplatePage({
  userWorkflows,
  libraryDevices,
  onDeleteWorkflow,
  onApplyUserWorkflow,
  onRefreshWorkflows,
}: TemplatePageProps) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TemplateItem[]>(withRegisteredDevices(fallbackTemplates, libraryDevices));
  const [cropFilter, setCropFilter] = useState("");
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [deletedTemplateIds, setDeletedTemplateIds] = useState<Set<string>>(new Set());
  const availableFallbackTemplates = fallbackTemplates.filter((tpl) => !deletedTemplateIds.has(tpl.id));
  const filterCount = (crop: string) =>
    crop ? availableFallbackTemplates.filter((tpl) => tpl.cropType === crop).length : availableFallbackTemplates.length;
 
  /* 템플릿 목록 로드 */
  const loadTemplates = useCallback(async (crop?: string) => {
    try {
      const data = await fetchTemplatesApi(crop || undefined);
      if (data.length > 0) {
        setTemplates(withRegisteredDevices(data, libraryDevices).filter((t) => !deletedTemplateIds.has(t.id)));
        return;
      }
    } catch {
      // 백엔드 미연결
    }
    // 백엔드 실패 시 로컬 필터링
    if (crop) {
      setTemplates(withRegisteredDevices(fallbackTemplates, libraryDevices).filter((t) => t.cropType === crop && !deletedTemplateIds.has(t.id)));
    } else {
      setTemplates(withRegisteredDevices(fallbackTemplates, libraryDevices).filter((t) => !deletedTemplateIds.has(t.id)));
    }
  }, [deletedTemplateIds, libraryDevices]);

  const handleDeleteTemplate = (templateId: string) => {
    if (!window.confirm("이 템플릿을 목록에서 삭제할까요?")) {
      return;
    }
    setDeletedTemplateIds((prev) => new Set(prev).add(templateId));
    setTemplates((prev) => prev.filter((tpl) => tpl.id !== templateId));
  };
 
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
 
  /* 작물 필터 변경 */
  const handleFilterChange = (crop: string) => {
    setCropFilter(crop);
    loadTemplates(crop);
  };
 
  /* 템플릿 적용 (워크플로우 + 스케줄 세트 복사) */
  const handleApplyTemplate = useCallback(async (tpl: TemplateItem) => {
    setApplyingId(tpl.id);
 
    // 1차: 백엔드 적용 API 시도
    try {
      const workflow = await applyTemplateApi(tpl.id);
      if (workflow.id) {
        await deployWorkflowApi(workflow.id);
      }
      onRefreshWorkflows();
      alert(`"${tpl.name}" 템플릿이 적용되었습니다.\n워크플로우가 바로 활성화되었습니다.`);
      setApplyingId(null);
      return;
    } catch {
      // 백엔드 미연결
    }
 
    // 2차: 워크플로우만 직접 생성
    try {
      const workflow = await saveWorkflowApi(tpl.name, tpl.flowData);
      if (workflow.id) {
        await deployWorkflowApi(workflow.id);
      }
      onRefreshWorkflows();
    } catch {
      // 완전 미연결
    }
    alert(`"${tpl.name}" 템플릿이 적용되었습니다.`);
    setApplyingId(null);
  }, [onRefreshWorkflows]);
 
  return (
    <>
      <div className="ff-page-head">
        <h1 className="ff-title">워크플로우 템플릿</h1>
        <p className="ff-sub">
          검증된 농업 알고리즘으로 스마트 팜을 즉시 가동하세요. 작물별 최적화된 기후, 수분, 영양 공급 워크플로우를 자유롭게 선택하고 수정할 수 있습니다.
        </p>
      </div>
 
      <div className="tpl-filter-panel" aria-label="작물 필터">
        <div className="tpl-filter-copy">
          <strong>작물 필터</strong>
          <span>{cropFilter ? `${cropLabel[cropFilter]} 템플릿` : "전체 템플릿"}</span>
        </div>
        <div className="tpl-filter-bar">
          {CROP_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`tpl-filter-btn${cropFilter === filter.value ? " tpl-filter-btn--active" : ""}`}
              onClick={() => handleFilterChange(filter.value)}
              aria-pressed={cropFilter === filter.value}
            >
              <span>{filter.label}</span>
              <em>{filterCount(filter.value)}</em>
            </button>
          ))}
        </div>
      </div>
 
      <main className="tpl-main">
        <div className="tpl-grid">
          {/* 새 워크플로우 생성 카드 */}
          <button
            type="button"
            className="tpl-card tpl-card--new"
            onClick={() => navigate("/logic-builder", { state: { reset: true } })}
          >
            <div className="tpl-card-new-icon">+</div>
            <h3>새 워크플로우 생성</h3>
            <p>나만의 커스텀 로직을 처음부터 설계합니다.</p>
          </button>
 
          {/* ── 샘플 템플릿 카드 ── */}
          {templates.map((tpl) => {
            const style = iconStyle[tpl.id] || defaultIconStyle;
            return (
              <article key={tpl.id} className="tpl-card">
                <div className="tpl-card-head">
                  <div className="tpl-icon-box" style={{ background: style.bg }} aria-hidden>
                    {tpl.name.charAt(0)}
                  </div>
                  <span className="tpl-tag" style={{ color: style.tagColor, background: style.tagBg }}>
                    {tpl.cropType ? cropLabel[tpl.cropType] || tpl.cropType : style.tag}
                  </span>
                </div>
                <h3>{tpl.name}</h3>
                <p>{tpl.description}</p>
 
                {/* 메타 정보 */}
                <div className="tpl-meta">
                  {tpl.author && (
                    <span className="tpl-meta-item">
                      <UserIcon size={13} /> {tpl.author}
                    </span>
                  )}
                  <span className="tpl-meta-item">
                    <Download size={13} /> {tpl.downloadCnt}회 적용
                  </span>
                </div>
 
                <div className="tpl-actions tpl-actions--with-delete">
                  <button
                    type="button"
                    className="tpl-btn-outline"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(tpl.flowData);
                        if (parsed.nodes && parsed.nodes.length > 0) {
                          navigate("/logic-builder", {
                            state: {
                              builtinSnapshot: { nodes: parsed.nodes, edges: parsed.edges || [] },
                              builtinTitle: tpl.name,
                            },
                          });
                          return;
                        }
                      } catch { /* flowData 비어있음 */ }
                      navigate("/logic-builder", { state: { reset: true } });
                    }}
                  >
                    편집
                  </button>
                  <button
                    type="button"
                    className="tpl-btn-primary"
                    disabled={applyingId === tpl.id}
                    onClick={() => handleApplyTemplate(tpl)}
                  >
                    {applyingId === tpl.id ? "적용 중..." : "적용"}
                  </button>
                  <button
                    type="button"
                    className="tpl-btn-delete"
                    aria-label="템플릿 삭제"
                    onClick={() => handleDeleteTemplate(tpl.id)}
                  >
                    <Trash2 size={18} strokeWidth={2} />
                    템플릿 삭제
                  </button>
                </div>
              </article>
            );
          })}
 
          {/* ── 사용자 워크플로우 카드 ── */}
          {userWorkflows.map((w) => (
            <article key={w.id} className="tpl-card tpl-card--user">
              <div className="tpl-card-head">
                <div className="tpl-icon-box tpl-icon-box--user" aria-hidden>
                  U
                </div>
                <span className="tpl-tag tpl-tag--user">MY</span>
              </div>
              <h3>{w.name}</h3>
              <div className="tpl-actions tpl-actions--with-delete">
                <button
                  type="button"
                  className="tpl-btn-outline"
                  onClick={() => navigate("/logic-builder", { state: { workflowId: w.id } })}
                >
                  편집
                </button>
                <button
                  type="button"
                  className="tpl-btn-primary"
                  onClick={() => onApplyUserWorkflow(w.id)}
                >
                  적용
                </button>
                <button
                  type="button"
                  className="tpl-btn-delete"
                  aria-label="템플릿 삭제"
                  onClick={() => onDeleteWorkflow(w.id)}
                >
                  <Trash2 size={18} strokeWidth={2} />
                  템플릿 삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
