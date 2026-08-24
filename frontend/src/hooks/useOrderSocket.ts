import { useEffect, useRef } from "react";
import { connectSocket } from "../socket/socket";
import type { PublicOrder } from "../types";

type Handlers = {
  onCreated?: (order: PublicOrder) => void;
  onUpdated?: (order: PublicOrder) => void;
  onAssigned?: (order: PublicOrder) => void;
  onStatusChanged?: (order: PublicOrder) => void;
};

export function useOrderSocket(handlers: Handlers): void {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const socket = connectSocket();

    const onCreated = (order: PublicOrder) => ref.current.onCreated?.(order);
    const onUpdated = (order: PublicOrder) => ref.current.onUpdated?.(order);
    const onAssigned = (order: PublicOrder) => ref.current.onAssigned?.(order);
    const onStatusChanged = (order: PublicOrder) =>
      ref.current.onStatusChanged?.(order);

    socket.on("order:created", onCreated);
    socket.on("order:updated", onUpdated);
    socket.on("order:assigned", onAssigned);
    socket.on("order:status_changed", onStatusChanged);

    return () => {
      socket.off("order:created", onCreated);
      socket.off("order:updated", onUpdated);
      socket.off("order:assigned", onAssigned);
      socket.off("order:status_changed", onStatusChanged);
    };
  }, []);
}

export function upsertOrder(
  prev: PublicOrder[],
  order: PublicOrder,
  teamUserId?: string
): PublicOrder[] {
  if (teamUserId && order.assignee?.uuid !== teamUserId) {
    return prev.filter((item) => item.uuid !== order.uuid);
  }
  const idx = prev.findIndex((item) => item.uuid === order.uuid);
  if (idx === -1) {
    return [order, ...prev];
  }
  const next = [...prev];
  next[idx] = order;
  return next;
}
