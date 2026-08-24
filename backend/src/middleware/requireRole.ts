import type { NextFunction, Request, Response } from "express";
import type { RoleCode } from "../entities/Role";
import { AppError } from "../lib/errors";

export function requireRole(...roles: RoleCode[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "unauthorized", "Необходима авторизация"));
      return;
    }

    if (!roles.includes(req.user.role.code)) {
      next(new AppError(403, "forbidden", "Недостаточно прав"));
      return;
    }

    next();
  };
}
