export type RoleCode = "operator" | "team";
export type WorkOrderStatus = "new" | "in_progress" | "done";

export type PublicUser = {
  uuid: string;
  fullName: string;
  phone: string;
  email: string;
  role: RoleCode;
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
  status: WorkOrderStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
