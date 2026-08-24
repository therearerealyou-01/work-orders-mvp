import type { ZodSchema } from "zod";
import { AppError } from "./errors";

export function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new AppError(
      400,
      "validation_error",
      "Ошибка валидации",
      result.error.flatten()
    );
  }
  return result.data;
}
