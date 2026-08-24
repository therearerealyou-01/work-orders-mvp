import type { WorkOrderStatus } from "../../types";
import { Tag } from "../../ui";

const MAP: Record<WorkOrderStatus, { color: "blue" | "orange" | "green"; label: string }> = {
  new: { color: "blue", label: "Новый" },
  in_progress: { color: "orange", label: "В работе" },
  done: { color: "green", label: "Выполнен" },
};

export function StatusTag({ status }: { status: WorkOrderStatus }) {
  const item = MAP[status];
  return <Tag color={item.color}>{item.label}</Tag>;
}

export const STATUS_OPTIONS = [
  { value: "new", label: "Новый" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Выполнен" },
] as const;
