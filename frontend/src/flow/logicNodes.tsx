<<<<<<< HEAD
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
      : "\ub0b4\ubd80 \uc628\uc2e4 \uc13c\uc11c";
  return (
    <div className="ff-node ff-node--sensor">
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <div className="ff-node__head">{"\uc13c\uc11c"}</div>
      <div className="ff-node__body">
        <div className="ff-node__title">{customName}</div>
        <div className="ff-node__row">
          <span>{"\uc628\ub3c4"}</span>
          <strong>24.5{"\u00b0"}C</strong>
        </div>
        <div className="ff-node__row">
          <span>{"\uc2b5\ub3c4"}</span>
=======
import { Handle, Position, type NodeProps } from "@xyflow/react";

export function SensorNode(_props: NodeProps) {
  return (
    <div className="ff-node ff-node--sensor">
      <div className="ff-node__head">센서</div>
      <div className="ff-node__body">
        <div className="ff-node__title">내부 온실 센서</div>
        <div className="ff-node__row">
          <span>온도</span>
          <strong>24.5°C</strong>
        </div>
        <div className="ff-node__row">
          <span>습도</span>
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
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
<<<<<<< HEAD
      <div className="ff-node__head">{"\uc870\uac74 IF"}</div>
      <div className="ff-node__body">
        <div className="ff-node__logic">
          &gt; 28{"\u00b0"}C
=======
      <div className="ff-node__head">조건 IF</div>
      <div className="ff-node__body">
        <div className="ff-node__logic">
          &gt; 28°C
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
          <br />
          AND &gt; 50%
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}

<<<<<<< HEAD
export function ActionNode(props: NodeProps) {
  const customName =
    props.data && typeof props.data.name === "string"
      ? props.data.name
      : "\ud658\uae30 \uc7a5\uce58 ON";
  return (
    <div className="ff-node ff-node--action">
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <div className="ff-node__head">{"\uc561\uc158"}</div>
      <div className="ff-node__body">
        <div className="ff-node__title">{customName}</div>
        <div className="ff-node__row">
          <span>{"\uc0c1\ud0dc"}</span>
          <strong>{"\ub300\uae30 -\u003e \uac00\ub3d9"}</strong>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}

export const reconnect = (oldEdge: Edge, newConnection: Connection, edges: Edge[]) =>
  reconnectEdge(oldEdge, newConnection, edges);
=======
export function ActionNode(_props: NodeProps) {
  return (
    <div className="ff-node ff-node--action">
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <div className="ff-node__head">액션</div>
      <div className="ff-node__body">
        <div className="ff-node__title">환기 장치 작동</div>
        <div className="ff-node__row">
          <span>상태</span>
          <strong>대기 → 가동</strong>
        </div>
      </div>
    </div>
  );
}
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
