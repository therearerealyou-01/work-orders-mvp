import "express-session";
import type { User } from "../entities/User";

declare module "express-session" {
  interface SessionData {
    userId: string;
    role: "operator" | "team";
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
