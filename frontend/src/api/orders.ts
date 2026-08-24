import { api } from "./client";
import type { PublicOrder, WorkOrderStatus } from "../types";

export async function fetchOrders(params?: {
  status?: WorkOrderStatus;
  assigneeId?: string;
}) {
  const { data } = await api.get<{ items: PublicOrder[] }>("/orders", {
    params,
  });

  return data.items;
}

export async function createOrder(body: {
  scheduledAt: string;
  address: string;
  description: string;
  assigneeId?: string | null;
}) {
  const { data } = await api.post<{ order: PublicOrder }>("/orders", body);

  return data.order;
}

export async function updateOrder(
  id: string,
  body: {
    scheduledAt?: string;
    address?: string;
    description?: string;
    assigneeId?: string | null;
  },
) {
  const { data } = await api.patch<{ order: PublicOrder }>(
    `/orders/${id}`,
    body,
  );

  return data.order;
}

export async function updateOrderStatus(id: string, status: WorkOrderStatus) {
  const { data } = await api.patch<{ order: PublicOrder }>(
    `/orders/${id}/status`,
    { status },
  );

  return data.order;
}
