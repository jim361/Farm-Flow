import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, LogOut, X, CheckCircle2, BadgeCheck } from "lucide-react";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const navigate = useNavigate();
  
  // 고정 데이터 (추후 DB나 전역 상태인 Context/Zustand 등에서 받아오도록 연동하세요)
  const userName = "Farmer"; 
  const userId = "farmflow_user";

  // --- 비밀번호 변경 관련 상태 변수 ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 현재 비밀번호 실시간 판단 (임시 비밀번호: 1234)
  const isPasswordVerified = currentPassword === "1234";

  if (!isOpen) return null;

  // 로그아웃 처리 함수
  const handleLogout = () => {
    const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmLogout) return;

    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.clear();

      alert("로그아웃 되었습니다.");
      onClose();
      navigate("/login");
    } catch (error) {
      console.error("로그아웃 처리 중 에러 발생:", error);
      alert("로그아웃 도중 오류가 발생했습니다.");
    }
  };

  // 회원 정보 수정 제출 함수
  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordVerified && newPassword !== confirmPassword) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }
    alert("비밀번호 변경이 완료되었습니다.");
    onClose();
  };

  return (
    <div className="ff-modal-overlay" onClick={onClose}>
      <div className="ff-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* 모달 헤더 */}
        <div className="ff-modal-header">
          <h3>회원 정보 수정</h3>
          <button type="button" className="ff-modal-close-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 1. 맨 위에 이름 배치 구역 */}
        <div className="ff-modal-user-profile">
          <div className="ff-avatar-placeholder">
            <User size={24} />
          </div>
          <div className="ff-user-info-text">
            <span className="ff-user-name">{userName}</span>
            <span className="ff-user-role">사용자 계정</span>
          </div>
        </div>

        {/* 모달 본문 (폼 영역) */}
        <form className="ff-modal-form" onSubmit={handleSubmitProfile}>
          
          {/* 2. 아이디 칸 (변경 불가능 전용) */}
          <div className="ff-form-group">
            <label><BadgeCheck size={14} /> 아이디 (이메일)</label>
            <input type="text" value={userId} disabled className="ff-input-disabled" />
          </div>

          {/* 3. 현재 비밀번호 입력 칸 */}
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

          {/* 4. 새 비밀번호 변경 칸 (평소 잠금 상태 -> 1234 입력 시 해제) */}
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

          <button type="submit" className="ff-submit-btn">
            비밀번호 변경 완료
          </button>
        </form>

        {/* 모달 푸터 (로그아웃 버튼) */}
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