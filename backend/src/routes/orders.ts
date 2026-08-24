import { Router } from "express";
import { z } from "zod";
import {
  createOrderSchema,
  listOrdersQuerySchema,
  updateOrderSchema,
  updateStatusSchema,
} from "../dto/order";
import { parseBody } from "../lib/validate";
import { AppError } from "../lib/errors";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import {
  createOrder,
  listOrders,
  updateOrder,
  updateOrderStatus,
} from "../services/order.service";

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const query = listOrdersQuerySchema.safeParse(req.query);

    if (!query.success) {
      throw new AppError(
        400,
        "validation_error",
        "Некорректные параметры фильтра",
        query.error.flatten(),
      );
    }

    const items = await listOrders({
      actor: req.user!,
      status: query.data.status,
      assigneeId: query.data.assigneeId,
    });

    res.json({ items });
  }),
);

ordersRouter.post(
  "/",
  requireRole("operator"),
  asyncHandler(async (req, res) => {
    const dto = parseBody(createOrderSchema, req.body);

    const order = await createOrder(req.user!, dto);

    res.status(201).json({ order });
  }),
);

const idParam = z.string().uuid("Некорректный идентификатор наряда");

ordersRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);

    const dto = parseBody(updateStatusSchema, req.body);

    const order = await updateOrderStatus(id, req.user!, dto.status);

    res.json({ order });
  }),
);

ordersRouter.patch(
  "/:id",
  requireRole("operator"),
  asyncHandler(async (req, res) => {
    const id = idParam.parse(req.params.id);

    const dto = parseBody(updateOrderSchema, req.body);

    const order = await updateOrder(id, dto);

    res.json({ order });
  }),
);
