import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { Role } from "../entities/Role";
import { User } from "../entities/User";
import { WorkOrder } from "../entities/WorkOrder";
import { InitSchema1700000000000 } from "../migrations/1700000000000-InitSchema";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  entities: [Role, User, WorkOrder],
  migrations: [InitSchema1700000000000],
  synchronize: false,
  logging: false,
});
