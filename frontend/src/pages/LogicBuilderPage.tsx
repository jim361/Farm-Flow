import { useCallback, useRef } from "react";
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
import { SensorNode, ConditionNode, ActionNode } from "../flow/logicNodes";

const nodeTypes: NodeTypes = {
  sensor: SensorNode,
  condition: ConditionNode,
  action: ActionNode,
};

const edgeStyle = {
  stroke: "#22c55e",
  strokeWidth: 2,
  strokeDasharray: "6 4",
};

const initialNodes: Node[] = [
  { id: "n1", type: "sensor", position: { x: 60, y: 140 }, data: {} },
  { id: "n2", type: "condition", position: { x: 360, y: 120 }, data: {} },
  { id: "n3", type: "action", position: { x: 660, y: 140 }, data: {} },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "n1", target: "n2", animated: true, style: edgeStyle },
  { id: "e2", source: "n2", target: "n3", animated: true, style: edgeStyle },
];

let id = 4;
const genId = () => `n${id++}`;

export function LogicBuilderPage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
    [setEdges],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("application/reactflow");
      if (!raw || !wrapRef.current) return;

      const type = raw as "sensor" | "condition" | "action";
      if (!["sensor", "condition", "action"].includes(type)) return;

      const bounds = wrapRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - bounds.left - 100,
        y: e.clientY - bounds.top - 40,
      };

      setNodes((nds) =>
        nds.concat({
          id: genId(),
          type,
          position,
          data: {},
          selected: false,
        }),
      );
    },
    [setNodes],
  );

  const onPaletteDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const deleteSelected = () => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  };

  return (
    <>
      <div className="ff-page-head">
        <h1 className="ff-title">비주얼 로직 빌더</h1>
        <p className="ff-sub">
          노드를 끌어다 놓아 연결하고, 선택 후 Delete 키 또는 삭제 버튼으로 노드/엣지를 제거할 수 있습니다.
        </p>
      </div>
      <div className="ff-workspace">
        <aside className="ff-palette" aria-label="블록 라이브러리">
          <h2 className="ff-palette-title">라이브러리</h2>
          <input type="search" className="ff-search" placeholder="블록 검색..." aria-label="블록 검색" />
          <button type="button" className="ff-delete-selected" onClick={deleteSelected}>
            선택 항목 삭제
          </button>
          <div className="ff-palette-section">
            <h3>센서</h3>
            <div className="ff-bar ff-bar--sensor" draggable onDragStart={(e) => onPaletteDragStart(e, "sensor")}>
              <span className="ff-bar-glyph">T</span>
              <span className="ff-bar-label">온도 센서</span>
            </div>
            <div className="ff-bar ff-bar--sensor" draggable onDragStart={(e) => onPaletteDragStart(e, "sensor")}>
              <span className="ff-bar-glyph">H</span>
              <span className="ff-bar-label">습도 센서</span>
            </div>
          </div>
          <div className="ff-palette-section">
            <h3>조건</h3>
            <div className="ff-bar ff-bar--condition" draggable onDragStart={(e) => onPaletteDragStart(e, "condition")}>
              <span className="ff-bar-glyph">IF</span>
              <span className="ff-bar-label">조건 분기</span>
            </div>
          </div>
          <div className="ff-palette-section">
            <h3>액션</h3>
            <div className="ff-bar ff-bar--action" draggable onDragStart={(e) => onPaletteDragStart(e, "action")}>
              <span className="ff-bar-glyph">V</span>
              <span className="ff-bar-label">환기 제어</span>
            </div>
            <div className="ff-bar ff-bar--action" draggable onDragStart={(e) => onPaletteDragStart(e, "action")}>
              <span className="ff-bar-glyph">P</span>
              <span className="ff-bar-label">관수 펌프</span>
            </div>
          </div>
        </aside>

        <div ref={wrapRef} className="ff-canvas-wrap" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={(_, edge) =>
              setEdges((eds) => eds.map((e) => ({ ...e, selected: e.id === edge.id })))
            }
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.4}
            maxZoom={1.4}
            deleteKeyCode={["Backspace", "Delete"]}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} size={1} color="#d4d4d8" />
            <Controls className="ff-controls" />
            <MiniMap nodeStrokeWidth={3} zoomable pannable maskColor="rgba(15, 23, 42, 0.08)" />
          </ReactFlow>
        </div>
      </div>
    </>
  );
}
