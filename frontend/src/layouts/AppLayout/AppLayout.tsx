import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { NAV } from "../../routes/paths";
import { Button, cx, Icon, Tag } from "../../ui";
import cl from "./AppLayout.module.css";

export function AppLayout() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const items = NAV[user.role];

  return (
    <div className={cl.root}>
      <aside className={cl.sider}>
        <nav className={cl.nav}>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cx(cl.navItem, isActive && cl.navItemActive)
              }
            >
              <Icon name={item.icon} />

              <span className={cl.navLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={cl.main}>
        <header className={cl.header}>
          <div className={cl.user}>
            <strong>{user.fullName}</strong>

            <Tag color={user.role === "operator" ? "blue" : "gold"}>
              {user.role === "operator"
                ? "Оператор"
                : (user.teamName ?? "Бригада")}
            </Tag>
          </div>

          <Button
            variant="secondary"
            icon="logout"
            onClick={() => void logout()}
          >
            Выйти
          </Button>
        </header>

        <main className={cl.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
