import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { RoleCode } from "../types";
import { CenteredSpinner } from "../ui";
import { homePath, PATHS } from "./paths";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <CenteredSpinner />;
  }

  if (!user) {
    return <Navigate to={PATHS.login} replace />;
  }

  return children;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: RoleCode[];
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={PATHS.login} replace />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate to={homePath(user.role)} replace />;
  }

  return children;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <CenteredSpinner />;
  }

  if (user) {
    return <Navigate to={homePath(user.role)} replace />;
  }

  return children;
}

export function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <CenteredSpinner />;
  }

  if (!user) {
    return <Navigate to={PATHS.login} replace />;
  }

  return <Navigate to={homePath(user.role)} replace />;
}
