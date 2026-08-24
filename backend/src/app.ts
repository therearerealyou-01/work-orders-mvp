import express from "express";
import cors from "cors";
import type { RequestHandler } from "express";
import { env } from "./config/env";
import { authRouter } from "./routes/auth";
import { ordersRouter } from "./routes/orders";
import { teamsRouter } from "./routes/teams";
import { healthRouter } from "./routes/health";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(sessionMiddleware: RequestHandler) {
  const app = express();

  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(sessionMiddleware);

  app.use((req, _res, next) => {
    console.log(`[http] ${req.method} ${req.path}`);
    next();
  });

  app.use("/auth", authRouter);
  app.use("/orders", ordersRouter);
  app.use("/teams", teamsRouter);
  app.use("/health", healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
