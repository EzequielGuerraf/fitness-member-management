import { NavLink, Outlet } from "react-router-dom";

const navigationItems = [
  { to: "/members", label: "Members" },
  { to: "/check-ins", label: "Check-ins" },
  { to: "/members/new", label: "Create Member" },
  { to: "/plans", label: "Plans" }
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-topbar__inner">
          <NavLink className="app-brand" to="/members">
            <p className="app-brand__label">Fitness Member Management</p>
            <p className="app-brand__meta">
              Manage your gym's members and plans.
            </p>
          </NavLink>

          <nav aria-label="Primary" className="app-nav">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  `app-nav__link${isActive ? " app-nav__link--active" : ""}`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  );
}
