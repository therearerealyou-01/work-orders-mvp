import { Router } from "express";
import { loginSchema, verify2faSchema } from "../dto/auth";
import { parseBody } from "../lib/validate";
import { serializeUser } from "../lib/serialize";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { startLogin, verify2fa } from "../services/auth.service";
import { env } from "../config/env";

export const authRouter = Router();

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const dto = parseBody(loginSchema, req.body);
    const result = await startLogin(dto.email, dto.password);
    res.json(result);
  })
);

authRouter.post(
  "/verify-2fa",
  asyncHandler(async (req, res) => {
    const dto = parseBody(verify2faSchema, req.body);
    const user = await verify2fa(dto.challengeId, dto.code);

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });

    req.session.userId = user.uuid;
    req.session.role = user.role;

    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    res.json({ user });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => (err ? reject(err) : resolve()));
    });
    res.clearCookie(env.COOKIE_NAME);
    res.json({ ok: true });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: serializeUser(req.user!) });
  })
);
