import { Router } from "express";
import { AppDataSource } from "../config/data-source";
import { redisClient } from "../config/redis";
import { asyncHandler } from "../middleware/asyncHandler";
import { isRabbitReady } from "../services/rabbit";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    let postgres = false;
    let redis = false;

    try {
      await AppDataSource.query("SELECT 1");
      postgres = true;
    } catch {
      postgres = false;
    }

    try {
      redis = (await redisClient.ping()) === "PONG";
    } catch {
      redis = false;
    }

    const rabbitmq = isRabbitReady();
    const ok = postgres && redis;

    res.status(ok ? 200 : 503).json({
      status: ok ? "ok" : "degraded",
      postgres,
      redis,
      rabbitmq,
    });
  }),
);
