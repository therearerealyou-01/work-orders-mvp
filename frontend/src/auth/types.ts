import { PublicUser } from "../types";

export type AuthState = {
  user: PublicUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ challengeId: string; devCode?: string }>;
  confirm2fa: (challengeId: string, code: string) => Promise<PublicUser>;
  logout: () => Promise<void>;
};
