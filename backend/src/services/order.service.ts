import { randomUUID } from "crypto";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { WorkOrder, type WorkOrderStatus } from "../entities/WorkOrder";
import type { CreateOrderDto, UpdateOrderDto } from "../dto/order";
import { AppError } from "../lib/errors";
import { serializeOrder, type PublicOrder } from "../lib/serialize";
import { publishOrderEvent } from "./rabbit";

const TEAM_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus | null> = {
  new: "in_progress",
  in_progress: "done",
  done: null,
};

function ordersRepo() {
  return AppDataSource.getRepository(WorkOrder);
}

function usersRepo() {
  return AppDataSource.getRepository(User);
}

async function loadOrder(uuid: string): Promise<WorkOrder> {
  const order = await ordersRepo().findOne({
    where: { uuid },
    relations: ["assignee", "assignee.role"],
  });

  if (!order) {
    throw new AppError(404, "not_found", "Наряд не найден");
  }

  return order;
}

function parseDate(value: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, "validation_error", "Некорректная дата выполнения");
  }

  return date;
}

async function resolveTeam(assigneeId: string | null): Promise<User | null> {
  if (assigneeId === null) {
    return null;
  }

  const user = await usersRepo().findOne({
    where: { uuid: assigneeId },
    relations: ["role"],
  });

  if (!user || user.role.code !== "team") {
    throw new AppError(
      400,
      "invalid_assignee",
      "Исполнитель должен быть бригадой",
    );
  }

  return user;
}

export async function listOrders(params: {
  actor: User;
  status?: WorkOrderStatus;
  assigneeId?: string;
}): Promise<PublicOrder[]> {
  const qb = ordersRepo()
    .createQueryBuilder("o")
    .leftJoinAndSelect("o.assignee", "assignee")
    .leftJoinAndSelect("assignee.role", "assigneeRole")
    .orderBy("o.createdAt", "DESC");

  if (params.actor.role.code === "team") {
    qb.andWhere("o.assigneeId = :uid", { uid: params.actor.uuid });
  } else {
    if (params.status) {
      qb.andWhere("o.status = :status", { status: params.status });
    }
    if (params.assigneeId) {
      qb.andWhere("o.assigneeId = :assigneeId", {
        assigneeId: params.assigneeId,
      });
    }
  }

  if (params.actor.role.code === "team" && params.status) {
    qb.andWhere("o.status = :status", { status: params.status });
  }

  const items = await qb.getMany();

  return items.map(serializeOrder);
}

export async function createOrder(
  actor: User,
  dto: CreateOrderDto,
): Promise<PublicOrder> {
  const assignee = await resolveTeam(dto.assigneeId ?? null);

  const order = ordersRepo().create({
    uuid: randomUUID(),
    scheduledAt: parseDate(dto.scheduledAt),
    address: dto.address,
    description: dto.description,
    status: "new",
    createdBy: actor.uuid,
    assignee: assignee ?? null,
    assigneeId: assignee?.uuid ?? null,
  });

  const saved = await ordersRepo().save(order);
  const loaded = await loadOrder(saved.uuid);
  const publicOrder = serializeOrder(loaded);

  publishOrderEvent("order.created", publicOrder);

  if (loaded.assignee) {
    publishOrderEvent("order.assigned", publicOrder, null);
  }

  return publicOrder;
}

export async function updateOrder(
  uuid: string,
  dto: UpdateOrderDto,
): Promise<PublicOrder> {
  const order = await loadOrder(uuid);
  const previousAssigneeId = order.assigneeId;

  if (dto.scheduledAt !== undefined) {
    order.scheduledAt = parseDate(dto.scheduledAt);
  }
  if (dto.address !== undefined) {
    order.address = dto.address;
  }
  if (dto.description !== undefined) {
    order.description = dto.description;
  }
  if (dto.assigneeId !== undefined) {
    const assignee = await resolveTeam(dto.assigneeId);
    order.assignee = assignee;
    order.assigneeId = assignee?.uuid ?? null;
  }

  await ordersRepo().save(order);
  const loaded = await loadOrder(order.uuid);
  const publicOrder = serializeOrder(loaded);

  const assigneeChanged = previousAssigneeId !== loaded.assigneeId;

  if (assigneeChanged) {
    publishOrderEvent("order.assigned", publicOrder, previousAssigneeId);
  } else {
    publishOrderEvent("order.updated", publicOrder, previousAssigneeId);
  }

  return publicOrder;
}

export async function updateOrderStatus(
  uuid: string,
  actor: User,
  status: WorkOrderStatus,
): Promise<PublicOrder> {
  const order = await loadOrder(uuid);

  if (actor.role.code === "team") {
    if (order.assigneeId !== actor.uuid) {
      throw new AppError(
        403,
        "forbidden",
        "Можно менять статус только своих нарядов",
      );
    }
    const allowed = TEAM_TRANSITIONS[order.status];
    if (allowed !== status) {
      throw new AppError(
        400,
        "invalid_transition",
        "Недопустимый переход статуса. Доступно: новый → в работе → выполнен",
      );
    }
  }

  order.status = status;
  await ordersRepo().save(order);
  const loaded = await loadOrder(order.uuid);
  const publicOrder = serializeOrder(loaded);

  publishOrderEvent("order.status_changed", publicOrder, loaded.assigneeId);
  return publicOrder;
}

export async function listTeams(): Promise<User[]> {
  return usersRepo()
    .createQueryBuilder("u")
    .innerJoinAndSelect("u.role", "role")
    .where("role.code = :code", { code: "team" })
    .orderBy("u.teamName", "ASC")
    .getMany();
}
