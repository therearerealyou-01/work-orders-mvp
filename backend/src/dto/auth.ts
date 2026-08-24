import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const verify2faSchema = z.object({
  challengeId: z.string().uuid("Некорректный идентификатор подтверждения"),
  code: z.string().regex(/^\d{6}$/, "Код должен состоять из 6 цифр"),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type Verify2faDto = z.infer<typeof verify2faSchema>;
