import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";
import type { RequestHandler } from "express";
import { Server } from "socket.io";
import type { Session, SessionData } from "express-session";
import { env } from "../config/env";
import type { OrderEvent } from "./rabbit";
import type { PublicOrder } from "../lib/serialize";

type SessionRequest = IncomingMessage & {
  session: Session & Partial<SessionData>;
};

let io: Server | null = null;

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO is not initialized");
  }
  return io;
}

export function createSocketServer(
  httpServer: HttpServer,
  sessionMiddleware: RequestHandler
): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigins,
      credentials: true,
    },
  });

  const wrap =
    (middleware: RequestHandler) =>
    (socket: { request: IncomingMessage }, next: (err?: Error) => void) => {
      middleware(
        socket.request as never,
        {} as never,
        next as never
      );
    };

  io.use(wrap(sessionMiddleware));

  io.use((socket, next) => {
    const req = socket.request as SessionRequest;
    if (!req.session?.userId || !req.session.role) {
      next(new Error("unauthorized"));
      return;
    }
    next();
  });

  io.on("connection", (socket) => {
    const req = socket.request as SessionRequest;
    const userId = req.session.userId;
    const role = req.session.role;
    if (!userId || !role) {
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${userId}`);
    if (role === "operator") {
      socket.join("operators");
    }

    console.log("[ws] connected", userId, role);

    socket.on("disconnect", () => {
      console.log("[ws] disconnected", userId);
    });
  });

  return io;
}

export function emitOrderEvent(event: OrderEvent): void {
  if (!io) {
    console.warn("[ws] skip emit, io not ready");
    return;
  }

  const payload = event.order;
  const eventName = toSocketEvent(event.type);

  io.to("operators").emit(eventName, payload);
  io.to("operators").emit("order:updated", payload);

  if (payload.assignee) {
    io.to(`user:${payload.assignee.uuid}`).emit(eventName, payload);
    io.to(`user:${payload.assignee.uuid}`).emit("order:updated", payload);
  }

  if (event.previousAssigneeId && event.previousAssigneeId !== payload.assignee?.uuid) {
    io.to(`user:${event.previousAssigneeId}`).emit("order:updated", {
      ...payload,
      assignee: payload.assignee,
    } satisfies PublicOrder);
  }
}

function toSocketEvent(type: OrderEvent["type"]): string {
  switch (type) {
    case "order.created":
      return "order:created";
    case "order.assigned":
      return "order:assigned";
    case "order.status_changed":
      return "order:status_changed";
    default:
      return "order:updated";
  }
}
