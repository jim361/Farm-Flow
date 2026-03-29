import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { nodeTypes } from './flowNodes'
import { DeploySafetyModal } from './DeploySafetyModal'
import './LogicBuilder.css'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'sensor',
    position: { x: 20, y: 70 },
    data: {
      category: '온도',
      label: '온도',
      value: '24.5°C',
      sensor: 'temperature',
    },
  },
  {
    id: '2',
    type: 'condition',
    position: { x: 230, y: 60 },
    data: {
      category: '만약 온도가 >',
      prompt: '만약 온도가 >',
      threshold: '30.0 °C',
    },
  },
  {
    id: '3',
    type: 'action',
    position: { x: 470, y: 55 },
    data: {
      variant: 'control',
      category: '환풍기',
      title: '환풍기',
      statusLabel: '상태 설정:',
      statusPill: '켜짐',
    },
  },
  {
    id: '4',
    type: 'sensor',
    position: { x: 20, y: 280 },
    data: {
      category: '습도',
      label: '습도',
      value: '62.8%',
      sensor: 'humidity',
    },
  },
  {
    id: '5',
    type: 'condition',
    position: { x: 230, y: 270 },
    data: {
      category: '만약 습도가 >',
      prompt: '만약 습도가 >',
      threshold: '80.0 %',
    },
  },
  {
    id: '6',
    type: 'action',
    position: { x: 470, y: 270 },
    data: {
      variant: 'alarm',
      category: '알림 보내기',
      title: '알림 보내기',
      quote: '"임계 습도 수준: 80%+"',
    },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: false },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' },
]

const defaultEdgeOptions = {
  style: { stroke: '#166534', strokeWidth: 2, strokeDasharray: '8 6' },
  type: 'smoothstep' as const,
}

function PaletteAppIcon() {
  return (
    <svg
      className="ff-palette-app-icon"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      aria-hidden
    >
      <rect x="1" y="1" width="8" height="8" rx="2" fill="#22c55e" opacity="0.95" />
      <rect x="13" y="1" width="8" height="8" rx="2" fill="#22c55e" opacity="0.75" />
      <rect x="1" y="13" width="8" height="8" rx="2" fill="#22c55e" opacity="0.75" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="#16a34a" opacity="0.9" />
    </svg>
  )
}

export function LogicBuilder() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [modalOpen, setModalOpen] = useState(false)

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, ...defaultEdgeOptions }, eds),
      ),
    [setEdges],
  )

  return (
    <div className="ff-app">
      <header className="ff-header">
        <div className="ff-brand">
          <span className="ff-logo">FarmFlow</span>
          <nav className="ff-nav" aria-label="주 메뉴">
            <a href="#dashboard" className="ff-nav-link">
              대시보드
            </a>
            <span className="ff-nav-link ff-nav-link--active">로직 빌더</span>
            <a href="#templates" className="ff-nav-link">
              워크플로우&amp;템플릿
            </a>
          </nav>
        </div>
        <div className="ff-header-actions">
          <button type="button" className="ff-icon-btn" aria-label="알림">
            🔔
          </button>
          <button type="button" className="ff-icon-btn" aria-label="설정">
            ⚙️
          </button>
          <button type="button" className="ff-avatar" aria-label="프로필">
            U
          </button>
        </div>
      </header>

      <div className="ff-main-head">
        <div>
          <h1 className="ff-title">비주얼 로직 빌더</h1>
          <p className="ff-sub">
            팔레트에서 노드를 드래그하여 연결하고 자동화 흐름을 구축하세요
          </p>
        </div>
        <button
          type="button"
          className="ff-deploy"
          onClick={() => setModalOpen(true)}
        >
          🚀 농장에 배포
        </button>
      </div>

      <div className="ff-workspace">
        <aside className="ff-palette" aria-label="노드 팔레트">
          <div className="ff-palette-title-row">
            <PaletteAppIcon />
            <h2 className="ff-palette-title">노드 팔레트</h2>
          </div>

          <section className="ff-palette-section">
            <h3>센서</h3>
            <div className="ff-palette-bars">
              <div className="ff-bar ff-bar--sensor ff-bar--static">
                <span className="ff-bar-icon" aria-hidden>
                  🌡️
                </span>
                <span className="ff-bar-label">온도</span>
              </div>
              <div className="ff-bar ff-bar--sensor ff-bar--static">
                <span className="ff-bar-icon" aria-hidden>
                  💧
                </span>
                <span className="ff-bar-label">습도</span>
              </div>
              <div className="ff-bar ff-bar--sensor ff-bar--static">
                <span className="ff-bar-icon" aria-hidden>
                  🫧
                </span>
                <span className="ff-bar-label">CO₂</span>
              </div>
              <div className="ff-bar ff-bar--sensor ff-bar--static">
                <span className="ff-bar-icon" aria-hidden>
                  ☀️
                </span>
                <span className="ff-bar-label">조도</span>
              </div>
            </div>
          </section>

          <section className="ff-palette-section">
            <h3>조건</h3>
            <div className="ff-palette-bars">
              <div className="ff-bar ff-bar--condition ff-bar--static">
                <span className="ff-bar-glyph" aria-hidden>
                  &gt;
                </span>
                <span className="ff-bar-label">높다</span>
              </div>
              <div className="ff-bar ff-bar--condition ff-bar--static">
                <span className="ff-bar-glyph" aria-hidden>
                  &lt;
                </span>
                <span className="ff-bar-label">낮다</span>
              </div>
              <div className="ff-bar ff-bar--condition ff-bar--static">
                <span className="ff-bar-glyph" aria-hidden>
                  =
                </span>
                <span className="ff-bar-label">동일</span>
              </div>
            </div>
          </section>

          <section className="ff-palette-section">
            <h3>액션</h3>
            <div className="ff-palette-bars">
              <div className="ff-bar ff-bar--action ff-bar--static">
                <span className="ff-bar-icon" aria-hidden>
                  ⏻
                </span>
                <span className="ff-bar-label">켜기</span>
              </div>
              <div className="ff-bar ff-bar--action ff-bar--static">
                <span className="ff-bar-icon" aria-hidden>
                  🔔
                </span>
                <span className="ff-bar-label">알림 보내기</span>
              </div>
            </div>
          </section>
        </aside>

        <div className="ff-canvas-wrap">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={defaultEdgeOptions}
            proOptions={{ hideAttribution: true }}
            nodesConnectable={true}
            nodesDraggable={true}
            elementsSelectable={true}
          >
            <Background gap={20} size={1} color="#d4cfe8" />
            <Controls
              position="bottom-right"
              showInteractive={false}
              className="ff-controls"
            />
          </ReactFlow>

          <div className="ff-floating-bar" role="toolbar" aria-label="편집 도구">
            <button type="button" title="실행 취소">
              ↶
            </button>
            <button type="button" title="다시 실행">
              ↷
            </button>
            <button type="button" title="저장">
              💾
            </button>
            <button type="button" title="복사">
              📋
            </button>
            <button type="button" title="삭제">
              🗑️
            </button>
          </div>
        </div>
      </div>

      <DeploySafetyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirmDeploy={() => {
          // 실제 배포 API 연동 지점
        }}
      />
    </div>
  )
}
