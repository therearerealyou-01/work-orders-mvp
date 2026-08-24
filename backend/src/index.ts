import "reflect-metadata";
import { createServer } from "http";
import { env } from "./config/env";
import { AppDataSource } from "./config/data-source";
import { connectRedis, redisClient } from "./config/redis";
import { createApp } from "./app";
import { createSessionMiddleware } from "./middleware/session";
import { createSocketServer, emitOrderEvent } from "./services/socket";
import { startRabbit, stopRabbit } from "./services/rabbit";
import { seed } from "./seed";
import { User } from "./entities/User";

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  console.log("[db] connected, migrations applied");

  if (env.AUTO_SEED) {
    const count = await AppDataSource.getRepository(User).count();
    if (count === 0) {
      console.log("[seed] empty database, running seed");
      await seed(AppDataSource);
    }
  }

  await connectRedis();

  const sessionMiddleware = createSessionMiddleware();
  const app = createApp(sessionMiddleware);
  const httpServer = createServer(app);

  createSocketServer(httpServer, sessionMiddleware);
  await startRabbit((event) => {
    emitOrderEvent(event);
  });

  httpServer.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `[http] port ${env.PORT} is already in use. Stop the other process or set PORT in backend/.env`
      );
      process.exit(1);
    }
    throw err;
  });

  httpServer.listen(env.PORT, "0.0.0.0", () => {
    console.log(`[http] listening on http://127.0.0.1:${env.PORT}`);
    console.log(`[ws] socket.io on same port`);
  });

  const shutdown = async (signal: string) => {
    console.log(`[shutdown] ${signal}`);
    httpServer.close();
    await stopRabbit();
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("[bootstrap] failed", err);
  process.exit(1);
});
