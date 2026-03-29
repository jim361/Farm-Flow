import { useCallback, useState } from 'react'
import './DeploySafetyModal.css'

type Scenario = {
  id: string
  title: string
  description: string
}

const SCENARIOS: Scenario[] = [
  {
    id: 'spike',
    title: '급격한 온도 상승',
    description: '온도가 28°C에서 급격히 30°C까지 상승하는 경우',
  },
  {
    id: 'humid',
    title: '고습도 유지',
    description: '습도가 80% 이상으로 장시간 유지되는 경우',
  },
]

type DeploySafetyModalProps = {
  open: boolean
  onClose: () => void
  onConfirmDeploy: () => void
}

const INITIAL_LOG = [
  '[시뮬레이션] 워크플로우 그래프 검증 중…',
  '노드 연결성 확인 완료 (5 노드)',
]

export function DeploySafetyModal({
  open,
  onClose,
  onConfirmDeploy,
}: DeploySafetyModalProps) {
  const [selectedId, setSelectedId] = useState(SCENARIOS[0].id)
  const [ran, setRan] = useState(false)
  const [logLines, setLogLines] = useState<string[]>(INITIAL_LOG)

  const runSimulation = useCallback(() => {
    const scenario = SCENARIOS.find((s) => s.id === selectedId)
    const extra =
      scenario?.id === 'spike'
        ? [
            '✓ 센서: 온도 30.0°C 임계값 초과 감지',
            '✓ 조건: 만약 온도가 > 30.0°C → 참',
            '✓ 액션: 환풍기 켜짐 (시뮬레이션)',
            '✓ 습도 분기: 임계 미도달 → 알림 미전송',
            '안전 검사 통과 — 충돌 또는 루프 없음',
          ]
        : [
            '✓ 센서: 습도 82% 임계값 초과',
            '✓ 조건: 만약 습도가 > 80.0% → 참',
            '✓ 액션: 알림 보내기 (시뮬레이션)',
            '✓ 온도 분기: 환풍기 동작 조건 불충족',
            '안전 검사 통과 — 충돌 또는 루프 없음',
          ]
    setLogLines([...INITIAL_LOG, ...extra])
    setRan(true)
  }, [selectedId])

  if (!open) return null

  return (
    <div className="dsm-overlay" role="dialog" aria-modal="true" aria-labelledby="dsm-title">
      <div className="dsm-panel">
        <header className="dsm-header">
          <div className="dsm-header-text">
            <h2 id="dsm-title">배포 전 안전 점검</h2>
            <p>
              배포 전 시뮬레이션을 실행하여 취약사항을 확인하세요.
            </p>
          </div>
          <div className="dsm-shield" aria-hidden>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"
                fill="#22c55e"
                fillOpacity="0.2"
                stroke="#16a34a"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </header>

        <div className="dsm-scenarios">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`dsm-scenario ${selectedId === s.id ? 'dsm-scenario--active' : ''}`}
              onClick={() => {
                setSelectedId(s.id)
                setRan(false)
                setLogLines(INITIAL_LOG)
              }}
            >
              <strong>{s.title}</strong>
              <span>{s.description}</span>
            </button>
          ))}
        </div>

        <div className="dsm-run-wrap">
          <button type="button" className="dsm-run" onClick={runSimulation}>
            <span className="dsm-run-icon" aria-hidden>
              ▶
            </span>
            시뮬레이션 실행
          </button>
        </div>

        {ran && (
          <>
            <div className="dsm-metrics">
              <div className="dsm-metric">
                <span className="dsm-metric-label">평균 시간</span>
                <span className="dsm-metric-value">2.3s</span>
              </div>
              <div className="dsm-metric">
                <span className="dsm-metric-label">노드 수</span>
                <span className="dsm-metric-value">5</span>
              </div>
              <div className="dsm-metric dsm-metric--safe">
                <span className="dsm-metric-label">안전 상태</span>
                <span className="dsm-metric-value dsm-safe">안전함</span>
              </div>
            </div>

            <div className="dsm-log" role="log" aria-live="polite">
              {logLines.map((line, i) => (
                <div key={`${i}-${line.slice(0, 24)}`} className="dsm-log-line">
                  <span className="dsm-log-ts">
                    {String(i + 1).padStart(2, '0')}:00
                  </span>
                  <span
                    className={line.startsWith('✓') ? 'dsm-log-ok' : 'dsm-log-info'}
                  >
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <footer className="dsm-footer">
          <button type="button" className="dsm-btn dsm-btn--ghost" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="dsm-btn dsm-btn--primary"
            onClick={() => {
              onConfirmDeploy()
              onClose()
            }}
          >
            확인 및 배포
          </button>
        </footer>
      </div>
    </div>
  )
}
