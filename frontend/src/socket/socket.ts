import { io, type Socket } from "socket.io-client";
import { API_URL } from "../api/client";

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  }

  socket = io(API_URL || undefined, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("[ws] connected", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.warn("[ws] connect_error", err.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (!socket) {
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
