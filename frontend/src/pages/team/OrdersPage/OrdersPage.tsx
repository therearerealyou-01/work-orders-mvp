import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import { fetchOrders, updateOrderStatus } from "../../../api/orders";
import { useAuth } from "../../../auth/AuthContext";
import { ExecuteOrderModal } from "../../../components/ExecuteOrderModal/ExecuteOrderModal";
import { StatusTag } from "../../../components/StatusTag/StatusTag";
import { upsertOrder, useOrderSocket } from "../../../hooks/useOrderSocket";
import type { PublicOrder } from "../../../types";
import {
  Button,
  Ellipsis,
  PageHeader,
  Table,
  toast,
  type Column,
} from "../../../ui";

export function TeamOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<PublicOrder | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await fetchOrders());
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useOrderSocket({
    onCreated: (order) => {
      if (!user) return;
      setOrders((prev) => upsertOrder(prev, order, user.uuid));
    },
    onUpdated: (order) => {
      if (!user) return;
      setOrders((prev) => upsertOrder(prev, order, user.uuid));
      setActive((current) => (current?.uuid === order.uuid ? order : current));
    },
    onAssigned: (order) => {
      if (!user) return;
      setOrders((prev) => upsertOrder(prev, order, user.uuid));
      if (order.assignee?.uuid === user.uuid) {
        toast.info(
          "Новый наряд",
          `${order.address} — ${dayjs(order.scheduledAt).format("DD.MM.YYYY HH:mm")}`,
        );
      }
    },
    onStatusChanged: (order) => {
      if (!user) return;
      setOrders((prev) => upsertOrder(prev, order, user.uuid));
      setActive((current) => (current?.uuid === order.uuid ? order : current));
    },
  });

  const columns: Column<PublicOrder>[] = [
    {
      key: "status",
      title: "Статус",
      width: 130,
      render: (row) => <StatusTag status={row.status} />,
    },
    {
      key: "date",
      title: "Дата",
      width: 160,
      render: (row) => dayjs(row.scheduledAt).format("DD.MM.YYYY HH:mm"),
    },
    { key: "address", title: "Адрес", render: (row) => row.address },
    {
      key: "description",
      title: "Описание",
      render: (row) => <Ellipsis>{row.description}</Ellipsis>,
    },
    {
      key: "actions",
      title: "",
      width: 160,
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setActive(row)}>
          Выполнить наряд
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Мои наряды" />

      <Table
        rowKey={(row) => row.uuid}
        loading={loading}
        columns={columns}
        rows={orders}
        pageSize={10}
        empty="Нет назначенных нарядов"
      />

      <ExecuteOrderModal
        open={Boolean(active)}
        order={active}
        loading={saving}
        onClose={() => setActive(null)}
        onStart={async () => {
          if (!active) {
            return;
          }

          setSaving(true);

          try {
            const updated = await updateOrderStatus(active.uuid, "in_progress");
            setOrders((prev) => upsertOrder(prev, updated, user?.uuid));
            setActive(updated);
            toast.success("Наряд взят в работу");
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setSaving(false);
          }
        }}
        onComplete={async () => {
          if (!active) {
            return;
          }

          setSaving(true);
          try {
            const updated = await updateOrderStatus(active.uuid, "done");
            setOrders((prev) => upsertOrder(prev, updated, user?.uuid));
            setActive(updated);
            toast.success("Наряд выполнен");
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
