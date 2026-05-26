import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { UserRound } from "lucide-react";
import { ProfileModal } from "./ProfileModal";
import "./AppHeader.css"; // 분리해 둔 CSS 스타일시트 링크 연동

const nav = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/logic-builder", label: "로직 빌더" },
  { to: "/devices", label: "장치등록" },
  { to: "/scheduler", label: "스케줄러" },
  { to: "/templates", label: "템플릿" },
];

type AppHeaderProps = {
  showSave?: boolean;
  onSave?: () => void;
  saveLabel?: string;
  showAdminPill?: boolean;
};

export function AppHeader({ showSave, onSave, saveLabel }: AppHeaderProps) {
  const { pathname } = useLocation();
  const isLogicBuilder = pathname === "/logic-builder";

  // 모달 토글을 위한 단독 State 배치
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <header className="ff-header">
        <div className="ff-brand">
          <span className="ff-logo">Farm Flow</span>
          <nav className="ff-nav">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => "ff-nav-link" + (isActive ? " ff-nav-link--active" : "")}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={"ff-header-actions" + (isLogicBuilder ? " ff-header-actions--stack" : "")}>
          <div className="ff-header-icons-row">
            {/* 💡 수정 포인트: 불필요한 주소 체크 분기문을 없애고 ff-icon-btn 스타일로 통합 고정 */}
            <button
              type="button"
              className="ff-icon-btn"
              aria-label="프로필 수정 메뉴"
              onClick={() => setIsProfileModalOpen(true)}
            >
              <UserRound size={20} strokeWidth={2} />
            </button>
          </div>

          {showSave && isLogicBuilder ? (
            <button type="button" className="ff-btn-save ff-btn-save--stack" onClick={onSave}>
              {saveLabel || "저장하기"}
            </button>
          ) : null}
        </div>
      </header>

      {/* 깔끔하게 쪼개진 프로필 모달 배치 */}
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
}