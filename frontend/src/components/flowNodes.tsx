import { memo } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { Droplets, Fan, Thermometer } from 'lucide-react'

import './flowNodes.css'

export type SensorNodeData = {
  category: string
  label: string
  value: string
  sensor: 'temperature' | 'humidity'
}

export type ConditionNodeData = {
  category: string
  prompt: string
  threshold: string
}

export type ActionNodeData =
  | {
      variant: 'control'
      category: string
      title: string
      statusLabel: string
      statusPill: string
    }
  | {
      variant: 'alarm'
      category: string
      title: string
      quote: string
    }

type SensorRF = Node<SensorNodeData, 'sensor'>
type ConditionRF = Node<ConditionNodeData, 'condition'>
type ActionRF = Node<ActionNodeData, 'action'>

function AlertDiamondIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        d="M12 3l8.66 8.66a1 1 0 010 1.41L12 21.73 3.34 13.07a1 1 0 010-1.41L12 3z"
        fill="#dcfce7"
        stroke="#16a34a"
        strokeWidth="1.35"
      />
      <path
        d="M12 8v5M12 16h.01"
        stroke="#15803d"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SensorNode({ data }: NodeProps<SensorRF>) {
  const Icon =
    data.sensor === 'humidity' ? (
      <Droplets className="ff-card__icon ff-card__icon--sensor" size={22} strokeWidth={2} />
    ) : (
      <Thermometer className="ff-card__icon ff-card__icon--sensor" size={22} strokeWidth={2} />
    )

  return (
    <div
      className={`ff-card ff-card--sensor${data.sensor === 'humidity' ? ' ff-card--sensor-humidity' : ''}`}
    >
      <div className="ff-card__accent ff-card__accent--sensor" aria-hidden />
      <div className="ff-card__body">
        <div className="ff-card__category ff-card__category--sensor">{data.category}</div>
        <div className="ff-card__title-row">
          {Icon}
          <span className="ff-card__title-text">{data.label}</span>
        </div>
        <div className="ff-card__value-large">{data.value}</div>
      </div>
      <Handle type="source" position={Position.Right} id="out" className="ff-handle ff-handle--right" />
    </div>
  )
}

function ConditionNode({ data }: NodeProps<ConditionRF>) {
  return (
    <div className="ff-card ff-card--condition">
      <Handle type="target" position={Position.Left} id="in" className="ff-handle ff-handle--left" />
      <div className="ff-card__accent ff-card__accent--condition" aria-hidden />
      <div className="ff-card__body">
        <div className="ff-card__category ff-card__category--condition">{data.category}</div>
        <div className="ff-card__prompt">{data.prompt}</div>
        <div className="ff-card__threshold" role="presentation">
          {data.threshold}
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="out" className="ff-handle ff-handle--right" />
    </div>
  )
}

function ActionNode({ data }: NodeProps<ActionRF>) {
  if (data.variant === 'control') {
    return (
      <div className="ff-card ff-card--action ff-card--action-control">
        <Handle type="target" position={Position.Left} id="in" className="ff-handle ff-handle--left" />
        <div className="ff-card__accent ff-card__accent--action" aria-hidden />
        <div className="ff-card__body">
          <div className="ff-card__category ff-card__category--action">{data.category}</div>
          <div className="ff-card__title-row">
            <Fan className="ff-card__icon ff-card__icon--action" size={22} strokeWidth={2} />
            <span className="ff-card__title-text">{data.title}</span>
          </div>
          <div className="ff-card__status-row">
            <span className="ff-card__status-label">{data.statusLabel}</span>
            <span className="ff-card__pill">{data.statusPill}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ff-card ff-card--action ff-card--action-alarm">
      <Handle type="target" position={Position.Left} id="in" className="ff-handle ff-handle--left" />
      <div className="ff-card__accent ff-card__accent--action" aria-hidden />
      <div className="ff-card__body">
        <div className="ff-card__category ff-card__category--action">{data.category}</div>
        <div className="ff-card__title-row">
          <AlertDiamondIcon className="ff-card__icon-slot" />
          <span className="ff-card__title-text">{data.title}</span>
        </div>
        <div className="ff-card__quote">{data.quote}</div>
      </div>
    </div>
  )
}

export const nodeTypes = {
  sensor: memo(SensorNode),
  condition: memo(ConditionNode),
  action: memo(ActionNode),
}
