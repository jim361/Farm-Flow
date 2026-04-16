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
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
// 프로젝트의 실제 경로에 맞춰 import 경로를 확인하세요.
import { SensorNode, ConditionNode, ActionNode, reconnect } from "../flow/logicNodes";
import type { LibraryDevice } from "../App";
 
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
 
// 초기 기본 노드 구성 (필요 시 사용)
const defaultNodes: Node[] = [
  { id: "n1", type: "sensor", position: { x: 60, y: 140 }, data: { name: "기본 센서", label: "기본 센서" } },
  { id: "n2", type: "condition", position: { x: 360, y: 120 }, data: { label: "조건 설정" } },
  // 기본 액션은 headerLabel 없이 → ActionNode 내부 기본값("액션") 사용
  { id: "n3", type: "action", position: { x: 660, y: 140 }, data: { name: "기본 액션", label: "기본 액션" } },
];
 
const defaultEdges: Edge[] = [
  { id: "e1", source: "n1", target: "n2", animated: true, style: edgeStyle },
  { id: "e2", source: "n2", target: "n3", animated: true, style: edgeStyle },
];
 
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
function cloneGraph(snapshot: { nodes: Node[]; edges: Edge[] } | null) {
  if (!snapshot || !snapshot.nodes || snapshot.nodes.length === 0) {
    return {
      nodes: JSON.parse(JSON.stringify(defaultNodes)) as Node[],
      edges: JSON.parse(JSON.stringify(defaultEdges)) as Edge[],
    };
  }
  return {
    nodes: JSON.parse(JSON.stringify(snapshot.nodes)) as Node[],
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
};
 
export const LogicBuilderPage = forwardRef<LogicBuilderHandle, LogicBuilderPageProps>(
  function LogicBuilderPage({ libraryDevices = [], pageTitle, initialSnapshot, onDeleteLibraryDevices }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const nextNodeIdRef = useRef(4);
 
    // initialSnapshot이 변경될 때 상태 초기화
    const snapshot = useMemo(() => cloneGraph(initialSnapshot), [initialSnapshot]);
 
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
      [setNodes]
    );
 
    // 라이브러리 아이템 드래그 시작 시 호출
    const onPaletteDragStart = (
      event: React.DragEvent,
      nodeType: string,
      deviceName?: string,
      headerLabel?: string,
    ) => {
      isDraggingRef.current = true; // 드래그 중 플래그 ON
      event.dataTransfer.setData("application/reactflow", nodeType);
      if (deviceName) {
        event.dataTransfer.setData("application/reactflow-name", deviceName);
      }
      if (headerLabel) {
        event.dataTransfer.setData("application/reactflow-header", headerLabel);
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
          <h1 className="ff-title">{pageTitle}</h1>
          <p className="ff-sub">
            라이브러리에서 장치를 끌어다 놓고 로직을 설계하세요.
          </p>
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
            {libraryDevices.filter(d => d.deviceType === "SENSOR").length > 0 && (
              <div className="ff-palette-section">
                <h3>등록 센서</h3>
                {libraryDevices
                  .filter((d) => d.deviceType === "SENSOR")
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`ff-bar ff-bar--sensor${selectedLibIds.has(item.id) ? " ff-bar--selected" : ""}`}
                      draggable
                      onMouseUp={() => toggleLibSelect(item.id)}
                      onDragStart={(e) => onPaletteDragStart(e, "sensor", item.name)}
                    >
                      <span className="ff-bar-glyph">S</span>
                      <span className="ff-bar-label">{item.name}</span>
                    </div>
                  ))}
              </div>
            )}
 
            {/* --- 조건 로직 --- */}
            <div className="ff-palette-section">
              <h3>로직</h3>
              <div
                className="ff-bar ff-bar--condition"
                draggable
                onDragStart={(e) => onPaletteDragStart(e, "condition")}
              >
                <span className="ff-bar-glyph">IF</span>
                <span className="ff-bar-label">조건 분기</span>
              </div>
              {/* 기본 액션 노드 (기본 등록) */}
              <div
                className="ff-bar ff-bar--action"
                draggable
                onDragStart={(e) => onPaletteDragStart(e, "action", "기본 액션")}
              >
                <span className="ff-bar-glyph">A</span>
                <span className="ff-bar-label">기본 액션</span>
              </div>
            </div>
 
            {/* --- 등록 제어기 목록 (백엔드 데이터) --- */}
            {libraryDevices.filter(d => d.deviceType === "ACTUATOR").length > 0 && (
              <div className="ff-palette-section">
                <h3>등록 제어기</h3>
                {libraryDevices
                  .filter((d) => d.deviceType === "ACTUATOR")
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`ff-bar ff-bar--action${selectedLibIds.has(item.id) ? " ff-bar--selected" : ""}`}
                      draggable
                      onMouseUp={() => toggleLibSelect(item.id)}
                      onDragStart={(e) => onPaletteDragStart(e, "action", item.name, "제어기")}
                    >
                      <span className="ff-bar-glyph">A</span>
                      <span className="ff-bar-label">{item.name}</span>
                    </div>
                  ))}
              </div>
            )}
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
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
      </div>
    );
  },
);
 
LogicBuilderPage.displayName = "LogicBuilderPage";