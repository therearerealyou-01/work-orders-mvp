import axios, { AxiosError } from "axios";
import type { ApiError } from "../types";

export const API_URL = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
});

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<ApiError>;

    if (!ax.response) {
      if (ax.code === "ECONNABORTED") {
        return "Сервер не ответил вовремя. Проверьте, что backend запущен на :3001";
      }

      return "Нет связи с сервером. Запустите backend и docker compose";
    }

    return ax.response.data?.error?.message ?? ax.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Неизвестная ошибка";
}
