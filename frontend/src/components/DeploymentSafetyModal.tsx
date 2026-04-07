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
        </div>
      </div>
    </div>
  );
}