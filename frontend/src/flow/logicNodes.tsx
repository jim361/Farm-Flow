import {
  Handle,
  Position,
  reconnectEdge,
  type Connection,
  type Edge,
  type NodeProps,
} from "@xyflow/react";

export function SensorNode(props: NodeProps) {
  const customName =
    props.data && typeof props.data.name === "string"
      ? props.data.name
      : "내부 온실 센서";
  return (
    <div className="ff-node ff-node--sensor">
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <div className="ff-node__head">센서</div>
      <div className="ff-node__body">
        <div className="ff-node__title">{customName}</div>
        <div className="ff-node__row">
          <span>온도</span>
          <strong>24.5°C</strong>
        </div>
        <div className="ff-node__row">
          <span>습도</span>
          <strong>62%</strong>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}

export function ConditionNode(_props: NodeProps) {
  return (
    <div className="ff-node ff-node--condition">
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <div className="ff-node__head">조건 IF</div>
      <div className="ff-node__body">
        <div className="ff-node__logic">
          &gt; 28°C
          <br />
          AND &gt; 50%
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}

export function ActionNode(props: NodeProps) {
  const customName =
    props.data && typeof props.data.name === "string"
      ? props.data.name
      : "환기 장치 ON";
  return (
    <div className="ff-node ff-node--action">
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <div className="ff-node__head">액션</div>
      <div className="ff-node__body">
        <div className="ff-node__title">{customName}</div>
        <div className="ff-node__row">
          <span>상태</span>
          <strong>대기 → 가동</strong>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}

export const reconnect = (oldEdge: Edge, newConnection: Connection, edges: Edge[]) =>
  reconnectEdge(oldEdge, newConnection, edges);
