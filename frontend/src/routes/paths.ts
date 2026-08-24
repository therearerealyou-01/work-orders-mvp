import type { RoleCode } from "../types";

export const PATHS = {
  login: "/login",
  operator: {
    orders: "/operator/orders",
    teams: "/operator/teams",
  },
  team: {
    orders: "/team/orders",
  },
} as const;

export type NavIcon = "orders" | "teams";

export type NavItem = {
  path: string;
  label: string;
  icon: NavIcon;
};

export const NAV: Record<RoleCode, NavItem[]> = {
  operator: [
    { path: PATHS.operator.orders, label: "Наряды", icon: "orders" },
    { path: PATHS.operator.teams, label: "Бригады", icon: "teams" },
  ],
  team: [{ path: PATHS.team.orders, label: "Мои наряды", icon: "orders" }],
};

export function homePath(role: RoleCode): string {
  return role === "operator" ? PATHS.operator.orders : PATHS.team.orders;
}
