import dayjs from "dayjs";
import { useEffect, useState, type FormEvent } from "react";
import type { PublicOrder, PublicTeam, WorkOrderStatus } from "../../types";
import { Button, Field, Input, Modal, Select, TextArea } from "../../ui";
import { STATUS_OPTIONS } from "../StatusTag/StatusTag";

type FormState = {
  address: string;
  description: string;
  scheduledAt: string;
  assigneeId: string;
  status: WorkOrderStatus;
};

function emptyForm(): FormState {
  return {
    address: "",
    description: "",
    scheduledAt: dayjs()
      .add(1, "day")
      .hour(9)
      .minute(0)
      .second(0)
      .format("YYYY-MM-DDTHH:mm"),
    assigneeId: "",
    status: "new",
  };
}

type Props = {
  open: boolean;
  submitting: boolean;
  teams: PublicTeam[];
  order: PublicOrder | null;
  onCancel: () => void;
  onSubmit: (values: {
    address: string;
    description: string;
    scheduledAt: string;
    assigneeId: string | null;
    status?: WorkOrderStatus;
  }) => Promise<void>;
};

export function OrderFormModal({
  open,
  submitting,
  teams,
  order,
  onCancel,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  useEffect(() => {
    if (!open) return;
    if (order) {
      setForm({
        address: order.address,
        description: order.description,
        scheduledAt: dayjs(order.scheduledAt).format("YYYY-MM-DDTHH:mm"),
        assigneeId: order.assignee?.uuid ?? "",
        status: order.status,
      });
    } else {
      setForm(emptyForm());
    }
    setErrors({});
  }, [open, order]);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.address.trim()) next.address = "Укажите адрес";
    if (!form.description.trim()) next.description = "Укажите описание";
    if (!form.scheduledAt) next.scheduledAt = "Укажите дату";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    await onSubmit({
      address: form.address.trim(),
      description: form.description.trim(),
      scheduledAt: dayjs(form.scheduledAt).toISOString(),
      assigneeId: form.assigneeId || null,
      status: order ? form.status : undefined,
    });
  }

  return (
    <Modal
      open={open}
      title={order ? "Редактировать наряд" : "Новый наряд"}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" form="order-form" loading={submitting}>
            Сохранить
          </Button>
        </>
      }
    >
      <form id="order-form" onSubmit={(event) => void handleSubmit(event)}>
        <Field label="Адрес" error={errors.address}>
          <Input
            placeholder="Город, улица, дом"
            value={form.address}
            onChange={(e) => patch("address", e.target.value)}
          />
        </Field>
        <Field label="Дата выполнения" error={errors.scheduledAt}>
          <Input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => patch("scheduledAt", e.target.value)}
          />
        </Field>
        <Field label="Исполнитель">
          <Select
            allowClear
            placeholder="Не назначен"
            value={form.assigneeId || undefined}
            onChange={(value) => patch("assigneeId", value ?? "")}
            options={teams.map((team) => ({
              value: team.uuid,
              label: team.teamName ?? team.fullName,
            }))}
          />
        </Field>
        {order && (
          <Field label="Статус">
            <Select
              value={form.status}
              onChange={(value) =>
                patch("status", (value ?? "new") as WorkOrderStatus)
              }
              options={STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
            />
          </Field>
        )}
        <Field label="Описание" error={errors.description}>
          <TextArea
            rows={4}
            placeholder="Что нужно сделать"
            value={form.description}
            onChange={(e) => patch("description", e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}
