import { NavLink, useLocation } from "react-router-dom";
import { Settings, UserRound } from "lucide-react";

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
  showAdminPill?: boolean;
};

export function AppHeader({ showSave, onSave, showAdminPill }: AppHeaderProps) {
  const { pathname } = useLocation();
  const isTemplate = pathname === "/templates";
  const isLogicBuilder = pathname === "/logic-builder";

  return (
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
      <div
        className={"ff-header-actions" + (isLogicBuilder ? " ff-header-actions--stack" : "")}
      >
        <div className="ff-header-icons-row">
          <button type="button" className="ff-icon-btn" aria-label="설정">
            <Settings size={20} strokeWidth={2} />
          </button>
          {isTemplate || showAdminPill ? (
            <div className="ff-user-pill" aria-label="관리자">
              <UserRound size={18} strokeWidth={2} />
            </div>
          ) : (
            <button type="button" className="ff-icon-btn" aria-label="프로필">
              <UserRound size={20} strokeWidth={2} />
            </button>
          )}
        </div>
        {showSave && isLogicBuilder ? (
          <button type="button" className="ff-btn-save ff-btn-save--stack" onClick={onSave}>
            저장하기
          </button>
        ) : null}
      </div>
    </header>
  );
}
