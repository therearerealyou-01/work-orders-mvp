import { api } from "./client";
import type { PublicTeam } from "../types";

export async function fetchTeams() {
  const { data } = await api.get<{ items: PublicTeam[] }>("/teams");

  return data.items;
}
