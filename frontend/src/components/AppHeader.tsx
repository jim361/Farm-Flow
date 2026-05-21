import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { UserRound } from "lucide-react";
import { ProfileModal } from "./ProfileModal";
import "./AppHeader.css"; // 분리해 낸 스타일시트 임포트 연동

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

export function AppHeader({ showSave, onSave, saveLabel, showAdminPill }: AppHeaderProps) {
  const { pathname } = useLocation();
  const isTemplate = pathname === "/templates";
  const isLogicBuilder = pathname === "/logic-builder";

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const isAdmin = isTemplate || showAdminPill;

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
            <button
              type="button"
              className={isAdmin ? "ff-user-pill" : "ff-icon-btn"}
              aria-label={isAdmin ? "관리자 프로필" : "프로필"}
              onClick={() => setIsProfileModalOpen(true)}
            >
              <UserRound size={isAdmin ? 18 : 20} strokeWidth={2} />
            </button>
          </div>

          {showSave && isLogicBuilder ? (
            <button type="button" className="ff-btn-save ff-btn-save--stack" onClick={onSave}>
              {saveLabel || "저장하기"}
            </button>
          ) : null}
        </div>
      </header>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        isAdmin={isAdmin} 
      />
    </>
  );
}