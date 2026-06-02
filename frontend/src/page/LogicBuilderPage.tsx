import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from "react";
import {
  ReactFlow,
  Background,
  // Controls,
  // MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import { SensorNode, ConditionNode, ActionNode, reconnect } from "../flow/logicNodes";
import type { LibraryDevice } from "../App";
import { fetchDashboardMetricsApi, getActiveGreenhouseUid } from "../api/api";
  
// 노드 타입 정의
const nodeTypes: NodeTypes = {
  sensor: SensorNode,
  condition: ConditionNode,
  action: ActionNode,
};
  
// 연결선 스타일
const edgeStyle = {
  stroke: "#22c55e",
  strokeWidth: 2,
  strokeDasharray: "6 4",
};

const simulatorTopic = (greenhouseUid: string, deviceUid: string, suffix: "telemetry" | "command") =>
  greenhouseUid
    ? `farmflow/greenhouses/${greenhouseUid}/devices/${deviceUid}/${suffix}`
    : `farmflow/greenhouses/{온실UID}/devices/${deviceUid}/${suffix}`;

const telemetryTopic = (device: LibraryDevice, greenhouseUid: string) =>
  device.mqttTopic || simulatorTopic(greenhouseUid, device.id, "telemetry");

const commandTopic = (device: LibraryDevice, greenhouseUid: string) => {
  if (device.mqttTopic?.includes("/command")) return device.mqttTopic;
  return simulatorTopic(greenhouseUid, device.id, "command");
};

const demoValue = (sensorType?: string | null) => {
  switch (sensorType?.toLowerCase()) {
    case "humidity": return "47%";
    case "co2": return "1680 ppm";
    case "light": return "3200 lux";
    default: return "--°C";
  }
};

const SENSOR_TYPE_TO_METRIC: Record<string, string> = {
  temperature: "temp",
  temp: "temp",
  humidity: "humidity",
  co2: "co2",
  "co₂": "co2",
  light: "light",
  lux: "light",
};

const formatMetricValue = (metricId: string, value: number): string => {
  switch (metricId) {
    case "temp": return `${value}°C`;
    case "humidity": return `${value}%`;
    case "co2": return `${value} ppm`;
    case "light": return `${value} lux`;
    default: return `${value}`;
  }
};
  
const conditionBlocks = [
  { key: "temperature", label: "온도 조건", metric: "temperature", unit: "°C", operator: ">", threshold: 30 },
  { key: "humidity", label: "습도 조건", metric: "humidity", unit: "%", operator: "<", threshold: 60 },
  { key: "co2", label: "CO2 조건", metric: "co2", unit: "ppm", operator: ">", threshold: 1000 },
  { key: "light", label: "조도 조건", metric: "light", unit: "lux", operator: "<", threshold: 500 },
];

const conditionData = (key: string) =>
  conditionBlocks.find((block) => block.key === key || block.label === key) || conditionBlocks[0];

const buildDefaultNodes = (_greenhouseUid: string): Node[] => [];
  
const defaultEdges: Edge[] = [];
  
/**
 * 새 노드 생성을 위한 ID 인덱스 계산
 */
function maxNodeIndex(nodes: Node[]): number {
  let max = 0;
  for (const n of nodes) {
    const m = /^n(\d+)$/.exec(n.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}
  
/**
 * 초기 그래프 데이터를 깊은 복사하여 초기화
 */
function cloneGraph(snapshot: { nodes: Node[]; edges: Edge[] } | null, greenhouseUid: string) {
  if (!snapshot || !snapshot.nodes || snapshot.nodes.length === 0) {
    return {
      nodes: JSON.parse(JSON.stringify(buildDefaultNodes(greenhouseUid))) as Node[],
      edges: JSON.parse(JSON.stringify(defaultEdges)) as Edge[],
    };
  }
  const clonedNodes = JSON.parse(JSON.stringify(snapshot.nodes)) as Node[];
  return {
    nodes: clonedNodes.map((node) => {
      if (node.type === "sensor") {
        const deviceUid = typeof node.data.deviceUid === "string" ? node.data.deviceUid : undefined;
        if (deviceUid && (!node.data.topic || String(node.data.topic).startsWith("farmflow/devices/"))) {
          return { ...node, data: { ...node.data, topic: simulatorTopic(greenhouseUid, deviceUid, "telemetry") } };
        }
      }
      if (node.type === "action") {
        const name = typeof node.data.name === "string" ? node.data.name : "";
        const deviceUid = name.match(/DEV-[A-Z0-9-]+/)?.[0];
        if (deviceUid && (!node.data.commandTopic || String(node.data.commandTopic).startsWith("farmflow/devices/"))) {
          return { ...node, data: { ...node.data, commandTopic: simulatorTopic(greenhouseUid, deviceUid, "command") } };
        }
      }
      return node;
    }),
    edges: JSON.parse(JSON.stringify(snapshot.edges)) as Edge[],
  };
}
  
export type LogicBuilderHandle = {
  getGraph: () => { nodes: Node[]; edges: Edge[] };
  setGraph: (nodes: Node[], edges: Edge[]) => void;
};
  
type LogicBuilderPageProps = {
  libraryDevices: LibraryDevice[]; // 백엔드에서 가져온 실제 장치 목록
  pageTitle: string;
  initialSnapshot: { nodes: Node[]; edges: Edge[] } | null;
  onDeleteLibraryDevices?: (ids: string[]) => void; // 라이브러리 장치 삭제 콜백
  onSave?: () => void;
  saveLabel?: string;
};
  
export const LogicBuilderPage = forwardRef<LogicBuilderHandle, LogicBuilderPageProps>(
  function LogicBuilderPage({ libraryDevices = [], pageTitle, initialSnapshot, onDeleteLibraryDevices, onSave, saveLabel }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const nextNodeIdRef = useRef(4);
    const greenhouseUid = getActiveGreenhouseUid();
  
    // initialSnapshot이 변경될 때 상태 초기화
    const snapshot = useMemo(() => cloneGraph(initialSnapshot, greenhouseUid), [initialSnapshot, greenhouseUid]);
  
    const [nodes, setNodes, onNodesChange] = useNodesState(snapshot.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(snapshot.edges);
    const [selectedCount, setSelectedCount] = useState(0);
  
    // 라이브러리 아이템 선택 상태
    const [selectedLibIds, setSelectedLibIds] = useState<Set<string>>(new Set());
    const isDraggingRef = useRef(false);
  
    const toggleLibSelect = (id: string) => {
      // 드래그 직후의 mouseUp은 무시
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        return;
      }
      setSelectedLibIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };
  
    // ID 관리 업데이트
    useLayoutEffect(() => {
      nextNodeIdRef.current = Math.max(4, maxNodeIndex(nodes) + 1);
    }, [nodes]);

    // 실시간 센서 값 폴링 (3초마다 백엔드 metrics API 조회 → 센서 노드 값 갱신)
    useEffect(() => {
      const poll = async () => {
        try {
          const metrics = await fetchDashboardMetricsApi();
          setNodes((nds) =>
            nds.map((node) => {
              if (node.type !== "sensor") return node;
              const sensorType = (node.data.sensorType as string | undefined)?.toLowerCase() ?? "";
              const metricId = SENSOR_TYPE_TO_METRIC[sensorType];
              if (!metricId) return node;
              const metric = metrics.find((m) => m.id === metricId);
              if (!metric) return node;
              const newValue = formatMetricValue(metricId, metric.value);
              if (node.data.value === newValue) return node;
              return { ...node, data: { ...node.data, value: newValue } };
            })
          );
        } catch {
          // 백엔드 미연결 시 조용히 무시
        }
      };

      poll();
      const intervalId = setInterval(poll, 3000);
      return () => clearInterval(intervalId);
    }, [setNodes]);
  
    const genId = () => `n${nextNodeIdRef.current++}`;
  
    // 부모 컴포넌트에서 호출 가능한 함수 정의
    useImperativeHandle(
      ref,
      () => ({
        getGraph: () => ({
          nodes: nodes,
          edges: edges,
        }),
        setGraph: (newNodes, newEdges) => {
          setNodes(newNodes);
          setEdges(newEdges);
        }
      }),
      [nodes, edges, setNodes, setEdges]
    );
  
    // 노드 연결 시 처리
    const onConnect = useCallback(
      (p: Connection) =>
        setEdges((eds) =>
          addEdge(
            {
              ...p,
              animated: true,
              style: edgeStyle,
            },
            eds,
          ),
        ),
      [setEdges]
    );
  
    const onDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }, []);
  
    // 라이브러리에서 캔버스로 드롭했을 때 노드 추가
    const onDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData("application/reactflow");
        const deviceName = e.dataTransfer.getData("application/reactflow-name"); // 드래그 시 저장한 이름
        const headerLabel = e.dataTransfer.getData("application/reactflow-header"); // 노드 헤더 라벨 (선택)
        const deviceJson = e.dataTransfer.getData("application/reactflow-device");
        const conditionKey = e.dataTransfer.getData("application/reactflow-condition");
        const device = deviceJson ? JSON.parse(deviceJson) as LibraryDevice : null;
  
        if (!type || !wrapRef.current) return;
  
        const bounds = wrapRef.current.getBoundingClientRect();
        const position = {
          x: e.clientX - bounds.left - 100,
          y: e.clientY - bounds.top - 40,
        };
  
        const defaultName = deviceName || (type === "condition" ? "조건 설정" : "미지정 장치");
        const nodeData: Record<string, unknown> = {
          name: defaultName,
          label: defaultName,
        };
        if (device && type === "sensor") {
          nodeData.deviceUid = device.id;
          nodeData.sensorType = device.sensorType || device.subtype;
          nodeData.topic = telemetryTopic(device, greenhouseUid);
          nodeData.value = demoValue(device.sensorType || device.subtype);
        }
        if (device && type === "action") {
          nodeData.deviceUid = device.id;
          nodeData.headerLabel = "제어기";
          nodeData.command = "ON";
          nodeData.commandTopic = commandTopic(device, greenhouseUid);
        }
        if (type === "condition") {
          const block = conditionData(conditionKey || defaultName);
          nodeData.name = block.label;
          nodeData.label = `${block.label.replace(" 조건", "")} ${block.operator} ${block.threshold}${block.unit}`;
          nodeData.metric = block.metric;
          nodeData.operator = block.operator;
          nodeData.threshold = block.threshold;
          nodeData.unit = block.unit;
          nodeData.expression = `${block.metric} ${block.operator} ${block.threshold}${block.unit}`;
        }
        // headerLabel이 지정된 경우에만 data에 추가 (등록 제어기 → "제어기")
        if (headerLabel) {
          nodeData.headerLabel = headerLabel;
        }
 
        setNodes((nds) =>
          nds.concat({
            id: genId(),
            type,
            position,
            data: nodeData,
            selected: false,
          }),
        );
      },
      [setNodes, greenhouseUid]
    );
 
    // 라이브러리 아이템 드래그 시작 시 호출
    const onPaletteDragStart = (
      event: React.DragEvent,
      nodeType: string,
      deviceName?: string,
      headerLabel?: string,
      device?: LibraryDevice,
      conditionKey?: string,
    ) => {
      isDraggingRef.current = true; // 드래그 중 플래그 ON
      event.dataTransfer.setData("application/reactflow", nodeType);
      if (deviceName) {
        event.dataTransfer.setData("application/reactflow-name", deviceName);
      }
      if (headerLabel) {
        event.dataTransfer.setData("application/reactflow-header", headerLabel);
      }
      if (device) {
        event.dataTransfer.setData("application/reactflow-device", JSON.stringify(device));
      }
      if (conditionKey) {
        event.dataTransfer.setData("application/reactflow-condition", conditionKey);
      }
      event.dataTransfer.effectAllowed = "move";
    };
 
    const onReconnect = useCallback(
      (oldEdge: Edge, newConnection: Connection) => {
        setEdges((eds) => reconnect(oldEdge, newConnection, eds));
      },
      [setEdges]
    );
 
    const deleteSelected = () => {
      // 1) 캔버스에서 선택된 노드/엣지 삭제
      setNodes((nds) => nds.filter((n) => !n.selected));
      setEdges((eds) => eds.filter((e) => !e.selected));
 
      // 2) 라이브러리에서 선택된 장치 삭제 + 해당 장치의 캔버스 노드도 함께 삭제
      if (selectedLibIds.size > 0) {
        // 선택된 장치들의 이름 목록 수집
        const selectedDeviceNames = new Set(
          libraryDevices
            .filter((d) => selectedLibIds.has(d.id))
            .map((d) => d.name)
        );
 
        // 캔버스에서 해당 이름의 노드 제거
        setNodes((nds) => {
          const remaining = nds.filter(
            (n) => !(typeof n.data.name === "string" && selectedDeviceNames.has(n.data.name))
          );
          // 삭제된 노드 ID 목록
          const removedIds = new Set(nds.filter((n) => !remaining.includes(n)).map((n) => n.id));
          // 삭제된 노드에 연결된 엣지도 제거
          if (removedIds.size > 0) {
            setEdges((eds) =>
              eds.filter((e) => !removedIds.has(e.source) && !removedIds.has(e.target))
            );
          }
          return remaining;
        });
 
        // 부모(App)에게 라이브러리 장치 삭제 요청 (백엔드 DELETE 호출)
        if (onDeleteLibraryDevices) {
          onDeleteLibraryDevices(Array.from(selectedLibIds));
        }
        setSelectedLibIds(new Set());
      }
    };
 
    useEffect(() => {
      const nodeCount = nodes.filter((n) => n.selected).length;
      const edgeCount = edges.filter((e) => e.selected).length;
      setSelectedCount(nodeCount + edgeCount + selectedLibIds.size);
    }, [nodes, edges, selectedLibIds]);
 
    return (
      <div className="ff-full-container">
        <div className="ff-page-head">
          <div className="ff-page-head-row">
            <div>
              <h1 className="ff-title">{pageTitle}</h1>
              <p className="ff-sub">
                등록된 센서, 직접 설정하는 조건, 등록된 제어기를 순서대로 연결해 로직을 설계하세요.
              </p>
              <p className="ff-sub" style={{ marginTop: 4 }}>
                내 온실 UID: <strong>{greenhouseUid || "미설정"}</strong>
              </p>
            </div>
            {onSave && (
              <button type="button" className="ff-btn-save" onClick={onSave}>
                {saveLabel || "저장하기"}
              </button>
            )}
          </div>
        </div>
 
        <div className="ff-workspace">
          {/* 왼쪽 라이브러리 팔레트 */}
          <aside className="ff-palette">
            <h2 className="ff-palette-title">장치 라이브러리</h2>
 
            <button
              type="button"
              className={`ff-delete-selected${selectedCount > 0 ? " ff-delete-selected--active" : ""}`}
              onClick={deleteSelected}
            >
              선택 삭제 ({selectedCount})
            </button>
 
            {/* --- 등록 센서 목록 (백엔드 데이터) --- */}
            <div className="ff-palette-section">
              <h3>센서</h3>
              {libraryDevices.filter((d) => d.deviceType === "SENSOR").length === 0 && (
                <p className="ff-palette-empty">장치 등록에서 센서를 먼저 추가하세요.</p>
              )}
              {libraryDevices
                .filter((d) => d.deviceType === "SENSOR")
                .map((item) => (
                  <div
                    key={item.id}
                    className={`ff-bar ff-bar--sensor${selectedLibIds.has(item.id) ? " ff-bar--selected" : ""}`}
                    draggable
                    onMouseUp={() => toggleLibSelect(item.id)}
                    onDragStart={(e) => onPaletteDragStart(e, "sensor", item.name, undefined, item)}
                  >
                    <span className="ff-bar-glyph">S</span>
                    <span className="ff-bar-label">{item.name}</span>
                  </div>
                ))}
            </div>
 
            {/* --- 조건 블록 --- */}
            <div className="ff-palette-section">
              <h3>조건</h3>
              {conditionBlocks.map((block) => (
                <div
                  key={block.key}
                  className="ff-bar ff-bar--condition"
                  draggable
                  onDragStart={(e) => onPaletteDragStart(e, "condition", block.label, undefined, undefined, block.key)}
                >
                  <span className="ff-bar-glyph">IF</span>
                  <span className="ff-bar-label">{block.label}</span>
                </div>
              ))}
            </div>
 
            {/* --- 등록 제어기 목록 (백엔드 데이터) --- */}
            <div className="ff-palette-section">
              <h3>제어기</h3>
              {libraryDevices.filter((d) => d.deviceType === "ACTUATOR").length === 0 && (
                <p className="ff-palette-empty">장치 등록에서 제어기를 먼저 추가하세요.</p>
              )}
              {libraryDevices
                .filter((d) => d.deviceType === "ACTUATOR")
                .map((item) => (
                  <div
                    key={item.id}
                    className={`ff-bar ff-bar--action${selectedLibIds.has(item.id) ? " ff-bar--selected" : ""}`}
                    draggable
                    onMouseUp={() => toggleLibSelect(item.id)}
                    onDragStart={(e) => onPaletteDragStart(e, "action", item.name, "제어기", item)}
                  >
                    <span className="ff-bar-glyph">C</span>
                    <span className="ff-bar-label">{item.name}</span>
                  </div>
                ))}
            </div>
          </aside>
 
          {/* 메인 캔버스 영역 */}
          <div ref={wrapRef} className="ff-canvas-wrap" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onReconnect={onReconnect}
              nodeTypes={nodeTypes}
              fitView
              deleteKeyCode={["Backspace", "Delete"]}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={16} size={1} color="#e2e8f0" />
              {/* <Controls />
              <MiniMap /> */}
            </ReactFlow>
          </div>
        </div>
      </div>
    );
  },
);
 
LogicBuilderPage.displayName = "LogicBuilderPage";
