import { useCallback, useState } from "react";
import { Check, Play, Shield } from "lucide-react";

type DeploymentSafetyModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirmDeploy?: (name: string) => void;
};

const MOCK_LOGS: { t: string; msg: string }[] = [
  { t: "[0.00s]", msg: "워크플로우 로드 및 검증 완료" },
  { t: "[0.12s]", msg: "내부 온실 센서 스냅샷: 32.1C / 58%" },
  { t: "[0.40s]", msg: "조건 노드 평가: > 28C AND > 50% -> 참" },
  { t: "[0.85s]", msg: "액추에이터 큐: 환기 장치 ON (우선순위 1)" },
  { t: "[1.20s]", msg: "안전 한계 검사 통과 (과가동 없음)" },
  { t: "[2.30s]", msg: "시뮬레이션 정상 종료" },
];

export function DeploymentSafetyModal({
  open,
  onClose,
  onConfirmDeploy,
}: DeploymentSafetyModalProps) {
  const [workflowName, setWorkflowName] = useState("");
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
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
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
            <p>저장 전 시뮬레이션을 실행하고 워크플로우 이름을 입력하세요.</p>
          </div>
          <div className="dsm-shield" aria-hidden>
            <Shield size={36} strokeWidth={1.75} />
          </div>
        </div>

        <div className="dsm-field-wrap">
          <label htmlFor="workflow-name" className="dsm-field-label">
            워크플로우 이름
          </label>
          <input
            id="workflow-name"
            className="dsm-input"
            placeholder="예: 온실 A구역 여름 환기 자동화"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
        </div>

        <div className="dsm-run-wrap">
          <button type="button" className="dsm-run" onClick={runSimulation} disabled={running}>
            <Play size={16} fill="currentColor" />
            {running ? "실행 중..." : "시뮬레이션 실행"}
          </button>
        </div>

        <div className="dsm-metrics">
          <div className="dsm-metric">
            <span className="dsm-metric-label">소요 시간</span>
            <span className="dsm-metric-value">{done ? "2.3s" : "-"}</span>
          </div>
          <div className="dsm-metric">
            <span className="dsm-metric-label">실행된 액션</span>
            <span className="dsm-metric-value">{done ? "5" : "-"}</span>
          </div>
          <div className={"dsm-metric" + (done ? " dsm-metric--safe" : "")}>
            <span className="dsm-metric-label">안전 상태</span>
            <span className="dsm-metric-value dsm-safe">
              {done ? (
                <>
                  <Check size={16} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                  안전함
                </>
              ) : (
                "-"
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
                  <span className="dsm-log-ok">v</span>{" "}
                  <span className="dsm-log-info">{line.msg}</span>
                </span>
              </div>
            ))
          ) : (
            <div className="dsm-log-line">
              <span className="dsm-log-info">시뮬레이션 실행 후 로그가 표시됩니다.</span>
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
              onConfirmDeploy?.(workflowName.trim());
              handleClose();
            }}
            disabled={!done || !workflowName.trim()}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
