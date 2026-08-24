import "reflect-metadata";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import type { DataSource } from "typeorm";
import { AppDataSource } from "./config/data-source";
import { Role } from "./entities/Role";
import { User } from "./entities/User";
import { WorkOrder } from "./entities/WorkOrder";

export const DEMO_PASSWORD = "Passw0rd!";

export async function seed(ds: DataSource): Promise<void> {
  const roleRepo = ds.getRepository(Role);
  const userRepo = ds.getRepository(User);
  const orderRepo = ds.getRepository(WorkOrder);

  let operatorRole = await roleRepo.findOne({ where: { code: "operator" } });
  if (!operatorRole) {
    operatorRole = await roleRepo.save(
      roleRepo.create({ name: "Оператор", code: "operator" })
    );
  }

  let teamRole = await roleRepo.findOne({ where: { code: "team" } });
  if (!teamRole) {
    teamRole = await roleRepo.save(
      roleRepo.create({ name: "Бригада", code: "team" })
    );
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users = [
    {
      email: "operator@demo.local",
      fullName: "Иванов Иван Иванович",
      phone: "+7 900 000-00-01",
      role: operatorRole,
      teamName: null as string | null,
    },
    {
      email: "team1@demo.local",
      fullName: "Петров Пётр Петрович",
      phone: "+7 900 000-00-02",
      role: teamRole,
      teamName: "Бригада 1",
    },
    {
      email: "team2@demo.local",
      fullName: "Сидоров Сидор Сидорович",
      phone: "+7 900 000-00-03",
      role: teamRole,
      teamName: "Бригада 2",
    },
  ];

  const savedUsers: Record<string, User> = {};

  for (const item of users) {
    let user = await userRepo.findOne({
      where: { email: item.email },
      relations: ["role"],
    });
    if (!user) {
      user = userRepo.create({
        uuid: randomUUID(),
        email: item.email,
        fullName: item.fullName,
        phone: item.phone,
        passwordHash,
        role: item.role,
        teamName: item.teamName,
      });
      user = await userRepo.save(user);
      console.log("[seed] created user", item.email);
    } else {
      user.passwordHash = passwordHash;
      user.fullName = item.fullName;
      user.phone = item.phone;
      user.role = item.role;
      user.teamName = item.teamName;
      user = await userRepo.save(user);
      console.log("[seed] updated user", item.email);
    }
    savedUsers[item.email] = user;
  }

  const orderCount = await orderRepo.count();
  if (orderCount === 0) {
    const operator = savedUsers["operator@demo.local"];
    const team1 = savedUsers["team1@demo.local"];
    const team2 = savedUsers["team2@demo.local"];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    await orderRepo.save([
      orderRepo.create({
        uuid: randomUUID(),
        assignee: team1,
        assigneeId: team1.uuid,
        scheduledAt: tomorrow,
        address: "ул. Ленина, 10, офис 3",
        status: "new",
        description: "Проверить оборудование на объекте и зафиксировать показания.",
        createdBy: operator.uuid,
      }),
      orderRepo.create({
        uuid: randomUUID(),
        assignee: team2,
        assigneeId: team2.uuid,
        scheduledAt: tomorrow,
        address: "пр. Мира, 45",
        status: "in_progress",
        description: "Плановое обслуживание. Заменить расходные материалы.",
        createdBy: operator.uuid,
      }),
      orderRepo.create({
        uuid: randomUUID(),
        assignee: null,
        assigneeId: null,
        scheduledAt: dayAfter,
        address: "ул. Садовая, 7к1",
        status: "new",
        description: "Новый объект, требуется первичная диагностика.",
        createdBy: operator.uuid,
      }),
    ]);
    console.log("[seed] created sample work orders");
  } else {
    console.log("[seed] work orders already exist, skip sample data");
  }
}

async function main(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await seed(AppDataSource);
  await AppDataSource.destroy();
  console.log("[seed] done");
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[seed] failed", err);
    process.exit(1);
  });
}
