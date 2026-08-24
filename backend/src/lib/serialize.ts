import type { User } from "../entities/User";
import type { WorkOrder } from "../entities/WorkOrder";

export type PublicUser = {
  uuid: string;
  fullName: string;
  phone: string;
  email: string;
  role: "operator" | "team";
  teamName: string | null;
};

export type PublicTeam = {
  uuid: string;
  fullName: string;
  phone: string;
  email: string;
  teamName: string | null;
};

export type PublicOrder = {
  uuid: string;
  assignee: PublicTeam | null;
  scheduledAt: string;
  address: string;
  status: "new" | "in_progress" | "done";
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export function serializeUser(user: User): PublicUser {
  return {
    uuid: user.uuid,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    role: user.role.code,
    teamName: user.teamName,
  };
}

export function serializeTeam(user: User): PublicTeam {
  return {
    uuid: user.uuid,
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    teamName: user.teamName,
  };
}

export function serializeOrder(order: WorkOrder): PublicOrder {
  return {
    uuid: order.uuid,
    assignee: order.assignee ? serializeTeam(order.assignee) : null,
    scheduledAt: order.scheduledAt.toISOString(),
    address: order.address,
    status: order.status,
    description: order.description,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    createdBy: order.createdBy,
  };
}
