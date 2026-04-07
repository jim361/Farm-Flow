<<<<<<< HEAD
import { useCallback, useEffect, useState } from "react";
import { Shield } from "lucide-react";
=======
import { useCallback, useState } from "react";
import { Check, Play, Shield } from "lucide-react";

type ScenarioId = "heat" | "frost";
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f

type DeploymentSafetyModalProps = {
  open: boolean;
  onClose: () => void;
<<<<<<< HEAD
  onConfirmDeploy?: (name: string) => void;
};

export function DeploymentSafetyModal({ open, onClose, onConfirmDeploy }: DeploymentSafetyModalProps) {
  const [workflowName, setWorkflowName] = useState("");

  useEffect(() => {
    if (open) setWorkflowName("");
  }, [open]);

  const handleClose = useCallback(() => {
=======
  onConfirmDeploy?: () => void;
};

const SCENARIOS: { id: ScenarioId; title: string; desc: string }[] = [
  { id: "heat", title: "폭염", desc: "온도가 30°C를 넘어가는 상황" },
  { id: "frost", title: "야간 서리", desc: "습도 상승과 함께 온도가 0°C 아래로 떨어짐" },
];

const MOCK_LOGS: { t: string; msg: string }[] = [
  { t: "[0.00s]", msg: "워크플로우 로드 및 검증 완료" },
  { t: "[0.12s]", msg: "내부 온실 센서 스냅샷: 32.1°C / 58%" },
  { t: "[0.40s]", msg: "조건 노드 평가: > 28°C AND > 50% → 참" },
  { t: "[0.85s]", msg: "액추에이터 큐: 환기 장치 ON (우선순위 1)" },
  { t: "[1.20s]", msg: "안전 한계 검사 통과 (과가동 없음)" },
  { t: "[2.30s]", msg: "시뮬레이션 정상 종료" },
];

export function DeploymentSafetyModal({
  open,
  onClose,
  onConfirmDeploy,
}: DeploymentSafetyModalProps) {
  const [scenario, setScenario] = useState<ScenarioId>("heat");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const runSimulation = useCallback(() => {
    setRunning(true);
    setDone(false);
    window.setTimeout(() => {
      setRunning(false);
      setDone(true);
    }, 900);
  }, []);

  const handleClose = useCallback(() => {
    setDone(false);
    setRunning(false);
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
<<<<<<< HEAD
    <div className="dsm-overlay" role="dialog" aria-modal="true" aria-labelledby="dsm-title" onMouseDown={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="dsm-panel">
        <div className="dsm-header">
          <div className="dsm-header-text">
            <h2 id="dsm-title">{"\uc774\ub984 \ub4f1\ub85d"}</h2>
            <p>{"\uc6cc\ud06c\ud50c\ub85c\uc6b0 \uc774\ub984\uc744 \uc785\ub825\ud55c \ub4a4 \uc800\uc7a5\ud558\uba74 \ud15c\ud50c\ub9bf \ud398\uc774\uc9c0\ub85c \uc774\ub3d9\ud569\ub2c8\ub2e4."}</p>
          </div>
          <div className="dsm-shield" aria-hidden><Shield size={36} strokeWidth={1.75} /></div>
        </div>

        <div className="dsm-field-wrap">
          <label htmlFor="workflow-name" className="dsm-field-label">{"\uc6cc\ud06c\ud50c\ub85c\uc6b0 \uc774\ub984"}</label>
          <input id="workflow-name" className="dsm-input" placeholder={"\uc608) \uc628\uc2e4 A \uad6c\uc5ed \uc5ec\ub984 \ud658\uae30"} value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
        </div>

        <div className="dsm-footer">
          <button type="button" className="dsm-btn dsm-btn--ghost" onClick={handleClose}>{"\ucde8\uc18c"}</button>
          <button type="button" className="dsm-btn dsm-btn--primary" onClick={() => { onConfirmDeploy?.(workflowName.trim()); handleClose(); }} disabled={!workflowName.trim()}>{"\uc800\uc7a5\ud558\uae30"}</button>
=======
    <div
      className="dsm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dsm-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="dsm-panel">
        <div className="dsm-header">
          <div className="dsm-header-text">
            <h2 id="dsm-title">배포 전 안전 점검</h2>
            <p>배포 전 시뮬레이션을 실행하여 워크플로우를 확인하세요</p>
          </div>
          <div className="dsm-shield" aria-hidden>
            <Shield size={36} strokeWidth={1.75} />
          </div>
        </div>

        <div className="dsm-scenarios">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={
                "dsm-scenario" + (scenario === s.id ? " dsm-scenario--active" : "")
              }
              onClick={() => setScenario(s.id)}
            >
              <strong>{s.title}</strong>
              <span>{s.desc}</span>
            </button>
          ))}
        </div>

        <div className="dsm-run-wrap">
          <button
            type="button"
            className="dsm-run"
            onClick={runSimulation}
            disabled={running}
          >
            <Play size={16} fill="currentColor" />
            {running ? "실행 중…" : "시뮬레이션 실행"}
          </button>
        </div>

        <div className="dsm-metrics">
          <div className="dsm-metric">
            <span className="dsm-metric-label">소요 시간</span>
            <span className="dsm-metric-value">{done ? "2.3s" : "—"}</span>
          </div>
          <div className="dsm-metric">
            <span className="dsm-metric-label">실행된 액션</span>
            <span className="dsm-metric-value">{done ? "5" : "—"}</span>
          </div>
          <div className={"dsm-metric" + (done ? " dsm-metric--safe" : "")}>
            <span className="dsm-metric-label">안전 상태</span>
            <span className={"dsm-metric-value dsm-safe"}>
              {done ? (
                <>
                  <Check
                    size={16}
                    style={{ verticalAlign: "-2px", marginRight: 4 }}
                  />
                  안전함
                </>
              ) : (
                "—"
              )}
            </span>
          </div>
        </div>

        <div className="dsm-log" aria-live="polite">
          {done ? (
            MOCK_LOGS.map((line) => (
              <div key={line.t} className="dsm-log-line">
                <span className="dsm-log-ts">{line.t}</span>
                <span>
                  <span className="dsm-log-ok">✓</span>{" "}
                  <span className="dsm-log-info">{line.msg}</span>
                </span>
              </div>
            ))
          ) : (
            <div className="dsm-log-line">
              <span className="dsm-log-info">
                시뮬레이션 실행 후 로그가 표시됩니다.
              </span>
            </div>
          )}
        </div>

        <div className="dsm-footer">
          <button type="button" className="dsm-btn dsm-btn--ghost" onClick={handleClose}>
            취소
          </button>
          <button
            type="button"
            className="dsm-btn dsm-btn--primary"
            onClick={() => {
              onConfirmDeploy?.();
              handleClose();
            }}
            disabled={!done}
          >
            확인 및 배포
          </button>
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> a7b464690b865eb1de56ffd541b5b6c12af3752f
