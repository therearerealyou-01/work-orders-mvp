import { api } from "./client";
import type { PublicUser } from "../types";

export async function login(email: string, password: string) {
  const { data } = await api.post<{
    requires2fa: true;
    challengeId: string;
    devCode?: string;
  }>("/auth/login", { email, password });

  return data;
}

export async function verify2fa(challengeId: string, code: string) {
  const { data } = await api.post<{ user: PublicUser }>("/auth/verify-2fa", {
    challengeId,
    code,
  });

  return data.user;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function fetchMe() {
  const { data } = await api.get<{ user: PublicUser }>("/auth/me");

  return data.user;
}
