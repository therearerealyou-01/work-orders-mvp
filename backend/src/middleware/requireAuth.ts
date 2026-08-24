import type { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { AppError } from "../lib/errors";
import { asyncHandler } from "./asyncHandler";

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const userId = req.session.userId;

    if (!userId) {
      throw new AppError(401, "unauthorized", "Необходима авторизация");
    }

    const user = await AppDataSource.getRepository(User).findOne({
      where: { uuid: userId },
      relations: ["role"],
    });

    if (!user) {
      await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => (err ? reject(err) : resolve()));
      });
      throw new AppError(401, "unauthorized", "Сессия недействительна");
    }

    req.user = user;
    next();
  },
);
