import session from "express-session";
import RedisStore from "connect-redis";
import type { RequestHandler } from "express";
import { env } from "../config/env";
import { redisClient } from "../config/redis";

export function createSessionMiddleware(): RequestHandler {
  return session({
    name: env.COOKIE_NAME,
    store: new RedisStore({ client: redisClient, prefix: "sess:" }),
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.isProd,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  });
}
