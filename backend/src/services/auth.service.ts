import { randomInt, randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/data-source";
import { redisClient } from "../config/redis";
import { User } from "../entities/User";
import { AppError } from "../lib/errors";
import { serializeUser, type PublicUser } from "../lib/serialize";

const TWO_FA_TTL_SEC = 5 * 60;

type ChallengePayload = {
  userId: string;
  code: string;
};

export async function startLogin(
  email: string,
  password: string,
): Promise<{ requires2fa: true; challengeId: string; devCode: string }> {
  const user = await AppDataSource.getRepository(User).findOne({
    where: { email: email.toLowerCase().trim() },
    relations: ["role"],
  });

  if (!user) {
    throw new AppError(401, "invalid_credentials", "Неверный email или пароль");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) {
    throw new AppError(401, "invalid_credentials", "Неверный email или пароль");
  }

  const challengeId = randomUUID();
  const code = String(randomInt(100000, 1000000));
  const payload: ChallengePayload = { userId: user.uuid, code };

  try {
    await redisClient.set(`2fa:${challengeId}`, JSON.stringify(payload), {
      EX: TWO_FA_TTL_SEC,
    });
  } catch {
    throw new AppError(
      503,
      "service_unavailable",
      "Redis недоступен. Запустите docker compose up -d",
    );
  }

  return { requires2fa: true, challengeId, devCode: code };
}

export async function verify2fa(
  challengeId: string,
  code: string,
): Promise<PublicUser> {
  let raw: string | null;

  try {
    raw = await redisClient.get(`2fa:${challengeId}`);
  } catch {
    throw new AppError(
      503,
      "service_unavailable",
      "Redis недоступен. Запустите docker compose up -d",
    );
  }

  if (!raw) {
    throw new AppError(
      401,
      "2fa_expired",
      "Код истёк или недействителен, войдите снова",
    );
  }

  const payload = JSON.parse(raw) as ChallengePayload;

  if (payload.code !== code) {
    throw new AppError(401, "invalid_2fa", "Неверный код подтверждения");
  }

  await redisClient.del(`2fa:${challengeId}`);

  const user = await AppDataSource.getRepository(User).findOne({
    where: { uuid: payload.userId },
    relations: ["role"],
  });

  if (!user) {
    throw new AppError(401, "unauthorized", "Пользователь не найден");
  }

  return serializeUser(user);
}
