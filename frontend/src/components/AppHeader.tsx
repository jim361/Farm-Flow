import { NavLink, useLocation } from "react-router-dom";
import { Settings, UserRound } from "lucide-react";

const nav = [
  { to: "/", label: "대시보드", end: true },
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

  return (
    <header className="ff-header">
      <div className="ff-brand">
        <span className="ff-logo">Smart Farm</span>
        <nav className="ff-nav" aria-label="주 메뉴">
          {nav.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                "ff-nav-link" + (isActive ? " ff-nav-link--active" : "")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="ff-header-actions">
        {showSave ? (
          <button type="button" className="ff-btn-save" onClick={onSave}>
            저장하기
          </button>
        ) : null}
        <button type="button" className="ff-icon-btn" aria-label="설정">
          <Settings size={20} strokeWidth={2} />
        </button>
        {isTemplate || showAdminPill ? (
          <div className="ff-user-pill">
            <UserRound size={18} strokeWidth={2} />
            관리자
          </div>
        ) : (
          <button type="button" className="ff-icon-btn" aria-label="프로필">
            <UserRound size={20} strokeWidth={2} />
          </button>
        )}
      </div>
    </header>
  );
}
