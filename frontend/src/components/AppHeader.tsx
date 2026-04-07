import { NavLink, useLocation } from "react-router-dom";
import { Settings, UserRound } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "\ub300\uc2dc\ubcf4\ub4dc" },
  { to: "/logic-builder", label: "\ub85c\uc9c1 \ube4c\ub354" },
  { to: "/devices", label: "\uc7a5\uce58\ub4f1\ub85d" },
  { to: "/scheduler", label: "\uc2a4\ucf00\uc904\ub7ec" },
  { to: "/templates", label: "\ud15c\ud50c\ub9bf" },
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
        <span className="ff-logo">Smart Farm</span>
        <nav className="ff-nav" aria-label="\uc8fc \uba54\ub274">
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                "ff-nav-link" + (isActive ? " ff-nav-link--active" : "")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className={"ff-header-actions" + (isLogicBuilder ? " ff-header-actions--stack" : "") }>
        <div className="ff-header-icons-row">
          <button type="button" className="ff-icon-btn" aria-label="\uc124\uc815">
            <Settings size={20} strokeWidth={2} />
          </button>
          {isTemplate || showAdminPill ? (
            <div className="ff-user-pill" aria-label="???">
              <UserRound size={18} strokeWidth={2} />
            </div>
          ) : (
            <button type="button" className="ff-icon-btn" aria-label="\ud504\ub85c\ud544">
              <UserRound size={20} strokeWidth={2} />
            </button>
          )}
        </div>
        {showSave && isLogicBuilder ? (
          <button type="button" className="ff-btn-save ff-btn-save--stack" onClick={onSave}>
            {"\uc800\uc7a5\ud558\uae30"}
          </button>
        ) : null}
      </div>
    </header>
  );
}