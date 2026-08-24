import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../../../api/client";
import {
  createOrder,
  fetchOrders,
  updateOrder,
  updateOrderStatus,
} from "../../../api/orders";
import { fetchTeams } from "../../../api/teams";
import { OrderFormModal } from "../../../components/OrderFormModal/OrderFormModal";
import {
  STATUS_OPTIONS,
  StatusTag,
} from "../../../components/StatusTag/StatusTag";
import { upsertOrder, useOrderSocket } from "../../../hooks/useOrderSocket";
import type { PublicOrder, PublicTeam, WorkOrderStatus } from "../../../types";
import {
  Button,
  Ellipsis,
  PageHeader,
  Select,
  Table,
  toast,
  type Column,
} from "../../../ui";
import styles from "./OrdersPage.module.css";

export function OperatorOrdersPage() {
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [teams, setTeams] = useState<PublicTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<WorkOrderStatus | undefined>();
  const [assigneeId, setAssigneeId] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PublicOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const items = await fetchOrders({ status, assigneeId });
      setOrders(items);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, assigneeId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    fetchTeams()
      .then(setTeams)
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  const applyLive = (order: PublicOrder) => {
    setOrders((prev) => {
      const matches =
        (!status || order.status === status) &&
        (!assigneeId || order.assignee?.uuid === assigneeId);

      if (!matches) {
        return prev.filter((item) => item.uuid !== order.uuid);
      }

      return upsertOrder(prev, order);
    });
  };

  useOrderSocket({
    onCreated: applyLive,
    onUpdated: applyLive,
    onAssigned: applyLive,
    onStatusChanged: applyLive,
  });

  const columns: Column<PublicOrder>[] = [
    {
      key: "status",
      title: "Статус",
      width: 130,
      render: (row) => <StatusTag status={row.status} />,
    },
    {
      key: "assignee",
      title: "Исполнитель",
      render: (row) =>
        row.assignee?.teamName ?? (
          <span className={styles.muted}>Не назначен</span>
        ),
    },
    {
      key: "date",
      title: "Дата",
      width: 160,
      render: (row) => dayjs(row.scheduledAt).format("DD.MM.YYYY HH:mm"),
    },
    {
      key: "address",
      title: "Адрес",
      render: (row) => row.address,
    },
    {
      key: "description",
      title: "Описание",
      render: (row) => <Ellipsis>{row.description}</Ellipsis>,
    },
    {
      key: "actions",
      title: "",
      width: 120,
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditing(row);
            setModalOpen(true);
          }}
        >
          Изменить
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Наряды"
        actions={
          <Button
            icon="plus"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Создать наряд
          </Button>
        }
      />

      <div className={styles.toolbar}>
        <Select
          allowClear
          placeholder="Статус"
          className={styles.filter}
          value={status}
          options={STATUS_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          onChange={(value) => setStatus(value as WorkOrderStatus | undefined)}
        />

        <Select
          allowClear
          placeholder="Бригада"
          className={styles.filterWide}
          value={assigneeId}
          options={teams.map((team) => ({
            value: team.uuid,
            label: team.teamName ?? team.fullName,
          }))}
          onChange={setAssigneeId}
        />
      </div>

      <Table
        rowKey={(row) => row.uuid}
        loading={loading}
        columns={columns}
        rows={orders}
        pageSize={10}
      />

      <OrderFormModal
        open={modalOpen}
        submitting={submitting}
        teams={teams}
        order={editing}
        onCancel={() => setModalOpen(false)}
        onSubmit={async (values) => {
          setSubmitting(true);
          try {
            if (editing) {
              let updated = await updateOrder(editing.uuid, {
                address: values.address,
                description: values.description,
                scheduledAt: values.scheduledAt,
                assigneeId: values.assigneeId,
              });

              if (values.status && values.status !== editing.status) {
                updated = await updateOrderStatus(editing.uuid, values.status);
              }

              setOrders((prev) => upsertOrder(prev, updated));
              toast.success("Наряд обновлён");
            } else {
              const created = await createOrder(values);
              setOrders((prev) => upsertOrder(prev, created));
              toast.success("Наряд создан");
            }
            setModalOpen(false);
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}
