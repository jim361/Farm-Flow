import { useCallback, useEffect, useState } from "react";
import { Shield } from "lucide-react";

type DeploymentSafetyModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirmDeploy?: (name: string) => void;
};

export function DeploymentSafetyModal({ open, onClose, onConfirmDeploy }: DeploymentSafetyModalProps) {
  const [workflowName, setWorkflowName] = useState("");

  useEffect(() => {
    if (open) setWorkflowName("");
  }, [open]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="dsm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dsm-title"
      onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="dsm-panel">
        <div className="dsm-header">
          <div className="dsm-header-text">
            <h2 id="dsm-title">이름 등록</h2>
            <p>워크플로우 이름을 입력한 뒤 저장하면 템플릿 페이지로 이동합니다.</p>
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
            placeholder="예) 온실 A 구역 여름 환기"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
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
            disabled={!workflowName.trim()}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
