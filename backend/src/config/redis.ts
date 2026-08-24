import { createClient } from "redis";
import { env } from "./env";

export const redisClient = createClient({
  url: env.REDIS_URL,
  disableOfflineQueue: true,
  socket: {
    connectTimeout: 3000,
    reconnectStrategy: (retries) => Math.min(retries * 200, 2000),
  },
});

redisClient.on("error", (err) => {
  console.error("[redis] error", err.message);
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("[redis] connected");
  }
}
