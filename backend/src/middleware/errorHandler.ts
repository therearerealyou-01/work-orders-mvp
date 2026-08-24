import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "validation_error",
        message: "Ошибка валидации",
        details: err.flatten(),
      },
    });
    return;
  }

  console.error("[error]", err);
  res.status(500).json({
    error: {
      code: "internal_error",
      message: "Внутренняя ошибка сервера",
    },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: { code: "not_found", message: "Маршрут не найден" },
  });
}
