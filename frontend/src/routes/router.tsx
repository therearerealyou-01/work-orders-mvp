import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout/AppLayout";
import { LoginPage } from "../pages/LoginPage/LoginPage";
import { OperatorOrdersPage } from "../pages/operator/OrdersPage/OrdersPage";
import { OperatorTeamsPage } from "../pages/operator/TeamsPage/TeamsPage";
import { TeamOrdersPage } from "../pages/team/OrdersPage/OrdersPage";
import { GuestOnly, RequireAuth, RequireRole, RootRedirect } from "./guards";
import { PATHS } from "./paths";

export const router = createBrowserRouter([
  {
    path: PATHS.login,
    element: (
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    ),
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: PATHS.operator.orders,
        element: (
          <RequireRole roles={["operator"]}>
            <OperatorOrdersPage />
          </RequireRole>
        ),
      },
      {
        path: PATHS.operator.teams,
        element: (
          <RequireRole roles={["operator"]}>
            <OperatorTeamsPage />
          </RequireRole>
        ),
      },
      {
        path: PATHS.team.orders,
        element: (
          <RequireRole roles={["team"]}>
            <TeamOrdersPage />
          </RequireRole>
        ),
      },
    ],
  },
  { path: "/", element: <RootRedirect /> },
  { path: "*", element: <RootRedirect /> },
]);
