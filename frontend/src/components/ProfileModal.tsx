import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Lock, User, LogOut, X, CheckCircle2, Mail } from "lucide-react";
import { API_BASE_URL, authFetch, logoutApi, getMeApi } from "../api/api";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState<{
    uid: string;
    name: string;
    email: string;
    greenhouseUid: string;
    role: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwVerified, setPwVerified] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwVerified(false);
    setPwError("");
    setPwSuccess("");
    getMeApi()
      .then((data) => setUserInfo(data))
      .catch(() => setUserInfo(null));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyCurrentPassword = async () => {
    setPwError("");
    if (!currentPassword.trim()) {
      setPwError("현재 비밀번호를 입력해주세요.");
      return;
    }
    try {
      const res = await authFetch(`${API_BASE_URL}/auth/verify-password`, {
        method: "POST",
        body: JSON.stringify({ password: currentPassword }),
      });
      if (res.ok) {
        setPwVerified(true);
        setPwError("");
      } else {
        const err = await res.json().catch(() => null);
        setPwVerified(false);
        setPwError(err?.error || "현재 비밀번호가 일치하지 않습니다.");
      }
    } catch {
      setPwError("서버 연결에 실패했습니다.");
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setPwError("새 비밀번호를 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("새 비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      if (res.ok) {
        alert("비밀번호가 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPwVerified(false);
        setPwError("");
        setPwSuccess("");
        onClose();
      } else {
        const err = await res.json().catch(() => null);
        setPwError(err?.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch {
      setPwError("서버 연결에 실패했습니다.");
    }
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwVerified && newPassword.trim()) {
      handleChangePassword();
    } else {
      onClose();
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmLogout) return;
    try {
      await logoutApi();
      alert("로그아웃 되었습니다.");
      onClose();
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 처리 중 에러:", error);
      alert("로그아웃 도중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div className="ff-modal-content" onClick={(e) => e.stopPropagation()}>

        <div className="ff-modal-header">
          <h3>회원 정보 수정</h3>
          <button type="button" className="ff-modal-close-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="ff-modal-form" onSubmit={handleSubmitProfile}>

          <div className="ff-form-group">
            <label><Mail size={14} /> 이메일 (아이디)</label>
            <input type="text" value={userInfo?.email || "로딩 중..."} disabled className="ff-input-disabled" />
          </div>

          <div className="ff-form-group">
            <label><User size={14} /> 이름</label>
            <input type="text" value={userInfo?.name || "로딩 중..."} disabled className="ff-input-disabled" />
          </div>

          <div className="ff-form-group">
            <label><Copy size={14} /> 내 온실 UID</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" value={userInfo?.greenhouseUid || "로딩 중..."} disabled className="ff-input-disabled" />
              <button
                type="button"
                onClick={() => userInfo?.greenhouseUid && navigator.clipboard?.writeText(userInfo.greenhouseUid)}
                style={{
                  padding: "8px 12px",
                  background: "#f8fafc",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  fontWeight: 700,
                }}
              >
                복사
              </button>
            </div>
          </div>

          <div className="ff-form-group">
            <label><Lock size={14} /> 현재 비밀번호 확인</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="password"
                placeholder="현재 비밀번호 입력"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPwVerified(false);
                  setPwError("");
                  setPwSuccess("");
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={handleVerifyCurrentPassword}
                style={{
                  padding: "8px 16px",
                  background: "#166534",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  whiteSpace: "nowrap",
                }}
              >
                확인
              </button>
            </div>
            {pwVerified && (
              <p className="ff-status-msg ff-success-msg">
                <CheckCircle2 size={12} /> 비밀번호가 확인되었습니다. 아래에서 변경할 수 있습니다.
              </p>
            )}
          </div>

          <div className="ff-form-group">
            <label style={{ color: pwVerified ? "#555555" : "#aaaaaa" }}>
              <Lock size={14} /> 새 비밀번호 변경
            </label>
            <input
              type="password"
              placeholder={pwVerified ? "새 비밀번호 입력 (6자 이상)" : "현재 비밀번호 확인이 필요합니다"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!pwVerified}
              className={!pwVerified ? "ff-input-disabled" : ""}
            />
            <input
              type="password"
              placeholder={pwVerified ? "새 비밀번호 확인" : "현재 비밀번호 확인이 필요합니다"}
              style={{ marginTop: "6px" }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!pwVerified}
              className={!pwVerified ? "ff-input-disabled" : ""}
            />
          </div>

          {pwError && <p style={{ color: "#dc2626", fontSize: "0.85rem", margin: "4px 0" }}>{pwError}</p>}
          {pwSuccess && <p style={{ color: "#166534", fontSize: "0.85rem", margin: "4px 0" }}>{pwSuccess}</p>}

          <button type="submit" className="ff-submit-btn">
            회원 정보 수정 완료
          </button>
        </form>

        <div className="ff-modal-footer">
          <button type="button" className="ff-logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>

      </div>
    </div>
  );
}
