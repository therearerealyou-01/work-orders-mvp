import { z } from "zod";

export const workOrderStatusSchema = z.enum(["new", "in_progress", "done"]);

export const createOrderSchema = z.object({
  scheduledAt: z.string().min(1, "Укажите дату выполнения"),
  address: z.string().trim().min(1, "Укажите адрес").max(500),
  description: z.string().trim().min(1, "Укажите описание").max(5000),
  assigneeId: z.string().uuid().nullable().optional(),
});

export const updateOrderSchema = z.object({
  scheduledAt: z.string().min(1).optional(),
  address: z.string().trim().min(1).max(500).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});

export const updateStatusSchema = z.object({
  status: workOrderStatusSchema,
});

export const listOrdersQuerySchema = z.object({
  status: workOrderStatusSchema.optional(),
  assigneeId: z.string().uuid().optional(),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
