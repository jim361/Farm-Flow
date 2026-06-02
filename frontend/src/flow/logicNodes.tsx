import {
  Handle,
  Position,
  reconnectEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type NodeProps,
} from "@xyflow/react";

function textData(data: NodeProps["data"], key: string, fallback: string) {
  return data && typeof data[key] === "string" ? data[key] : fallback;
}

function numberData(data: NodeProps["data"], key: string, fallback: number) {
  if (!data) return fallback;
  const value = data[key];
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return fallback;
}

function expression(metric: string, operator: string, threshold: number, unit: string) {
  return `${metric} ${operator} ${threshold}${unit}`;
}

const metricLabel: Record<string, string> = {
  temperature: "온도",
  humidity: "습도",
  co2: "CO2",
  light: "조도",
};

export function SensorNode(props: NodeProps) {
  const customName = textData(props.data, "name", "등록 센서");
  const deviceUid = textData(props.data, "deviceUid", "-");
  const currentValue = textData(props.data, "value", "-");
  const topic = textData(props.data, "topic", "-");

  return (
    <div className="ff-node ff-node--sensor">
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <div className="ff-node__head">센서</div>
      <div className="ff-node__body">
        <div className="ff-node__title">{customName}</div>
        <div className="ff-node__row">
          <span>UID</span>
          <strong>{deviceUid}</strong>
        </div>
        <div className="ff-node__row">
          <span>현재값</span>
          <strong>{currentValue}</strong>
        </div>
        <div className="ff-node__row">
          <span>Topic</span>
          <strong className="ff-node__topic">{topic}</strong>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}

export function ConditionNode(props: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const metric = textData(props.data, "metric", "temperature");
  const unit = textData(props.data, "unit", "°C");
  const operator = textData(props.data, "operator", ">");
  const threshold = numberData(props.data, "threshold", 30);
  const title = `${metricLabel[metric] || "조건"} 조건`;
  const currentExpression = expression(metric, operator, threshold, unit);

  const updateCondition = (next: { operator?: string; threshold?: number }) => {
    const nextOperator = next.operator ?? operator;
    const nextThreshold = next.threshold ?? threshold;
    updateNodeData(props.id, {
      label: `${metricLabel[metric] || metric} ${nextOperator} ${nextThreshold}${unit}`,
      operator: nextOperator,
      threshold: nextThreshold,
      expression: expression(metric, nextOperator, nextThreshold, unit),
    });
  };

  return (
    <div className="ff-node ff-node--condition">
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <div className="ff-node__head">조건</div>
      <div className="ff-node__body">
        <div className="ff-node__title">{title}</div>
        <div className="ff-condition-editor nodrag" onMouseDown={(event) => event.stopPropagation()}>
          <span>{metricLabel[metric] || metric}</span>
          <select
            className="ff-node-select"
            value={operator}
            onChange={(event) => updateCondition({ operator: event.target.value })}
          >
            <option value=">">초과</option>
            <option value=">=">이상</option>
            <option value="<">미만</option>
            <option value="<=">이하</option>
            <option value="==">같음</option>
          </select>
          <input
            className="ff-node-input"
            type="number"
            value={Number.isFinite(threshold) ? threshold : ""}
            onChange={(event) => updateCondition({ threshold: Number(event.target.value) })}
          />
          <strong>{unit}</strong>
        </div>
        <div className="ff-node__logic">{currentExpression}</div>
      </div>
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}

export function ActionNode(props: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const customName = textData(props.data, "name", "등록 제어기");
  const headerLabel = textData(props.data, "headerLabel", "제어기");
  const command = textData(props.data, "command", "ON");
  const topic = textData(props.data, "commandTopic", "-");

  const updateCommand = (nextCommand: string) => {
    updateNodeData(props.id, {
      command: nextCommand,
      label: `${customName} ${nextCommand}`,
    });
  };

  return (
    <div className="ff-node ff-node--action">
      <Handle type="target" position={Position.Left} className="ff-handle" />
      <div className="ff-node__head">{headerLabel}</div>
      <div className="ff-node__body">
        <div className="ff-node__title">{customName}</div>
        <div className="ff-action-editor nodrag" onMouseDown={(event) => event.stopPropagation()}>
          <span>명령</span>
          <select
            className="ff-node-select"
            value={command}
            onChange={(event) => updateCommand(event.target.value)}
          >
            <option value="ON">켜기</option>
            <option value="OFF">끄기</option>
          </select>
        </div>
        <div className="ff-node__row">
          <span>Topic</span>
          <strong className="ff-node__topic">{topic}</strong>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="ff-handle" />
    </div>
  );
}

export const reconnect = (oldEdge: Edge, newConnection: Connection, edges: Edge[]) =>
  reconnectEdge(oldEdge, newConnection, edges);
