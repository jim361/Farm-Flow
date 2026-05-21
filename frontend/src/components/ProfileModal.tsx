import { useState } from "react";
import { Lock, Phone, User, LogOut, X, CheckCircle2 } from "lucide-react";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
};

export function ProfileModal({ isOpen, onClose, isAdmin }: ProfileModalProps) {
  const userId = "farmflow_user";

  // 비밀번호 및 입력 상태 관리
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 실시간 비밀번호 검증 (테스트 비밀번호: 1234)
  const isPasswordVerified = currentPassword === "1234";

  if (!isOpen) return null;

  const handleLogout = () => {
    const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
    if (confirmLogout) {
      console.log("로그아웃 로직 실행");
      onClose();
    }
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordVerified && newPassword !== confirmPassword) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }
    alert("회원 정보 수정이 완료되었습니다.");
    onClose();
  };

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div className="ff-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* 모달 헤더 */}
        <div className="ff-modal-header">
          <h3>{isAdmin ? "관리자 프로필 설정" : "회원 정보 수정"}</h3>
          <button type="button" className="ff-modal-close-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 모달 본문 (폼 영역) */}
        <form className="ff-modal-form" onSubmit={handleSubmitProfile}>
          <div className="ff-form-group">
            <label><User size={14} /> 아이디</label>
            <input type="text" value={userId} disabled className="ff-input-disabled" />
          </div>

          <div className="ff-form-group">
            <label><Lock size={14} /> 현재 비밀번호 확인</label>
            <input 
              type="password" 
              placeholder="현재 비밀번호 입력 (테스트: 1234)" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            {isPasswordVerified && (
              <p className="ff-status-msg ff-success-msg">
                <CheckCircle2 size={12} /> 비밀번호가 일치합니다. 아래에서 변경 가능합니다.
              </p>
            )}
          </div>

          <div className="ff-form-group">
            <label style={{ color: isPasswordVerified ? "#555555" : "#aaaaaa" }}>
              <Lock size={14} /> 새 비밀번호 변경
            </label>
            <input 
              type="password" 
              placeholder={isPasswordVerified ? "새 비밀번호 입력" : "현재 비밀번호 확인이 필요합니다"} 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={!isPasswordVerified}
              className={!isPasswordVerified ? "ff-input-disabled" : ""}
              required={isPasswordVerified}
            />
            <input 
              type="password" 
              placeholder={isPasswordVerified ? "새 비밀번호 확인" : "현재 비밀번호 확인이 필요합니다"} 
              style={{ marginTop: "6px" }} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!isPasswordVerified}
              className={!isPasswordVerified ? "ff-input-disabled" : ""}
              required={isPasswordVerified}
            />
          </div>

          <div className="ff-form-group">
            <label><Phone size={14} /> 전화번호 변경</label>
            <input type="tel" placeholder="010-0000-0000" />
          </div>

          <button type="submit" className="ff-submit-btn">
            회원 정보 수정 완료
          </button>
        </form>

        {/* 모달 푸터 */}
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