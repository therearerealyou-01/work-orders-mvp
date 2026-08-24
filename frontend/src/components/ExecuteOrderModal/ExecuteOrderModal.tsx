import dayjs from "dayjs";
import type { PublicOrder } from "../../types";
import { Button, Modal } from "../../ui";
import { StatusTag } from "../StatusTag/StatusTag";
import styles from "./ExecuteOrderModal.module.css";

type Props = {
  open: boolean;
  order: PublicOrder | null;
  loading: boolean;
  onClose: () => void;
  onStart: () => void;
  onComplete: () => void;
};

export function ExecuteOrderModal({
  open,
  order,
  loading,
  onClose,
  onStart,
  onComplete,
}: Props) {
  return (
    <Modal
      open={open}
      title="Выполнить наряд"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
          {order?.status === "new" && (
            <Button loading={loading} onClick={onStart}>
              Взять в работу
            </Button>
          )}
          {order?.status === "in_progress" && (
            <Button loading={loading} onClick={onComplete}>
              Завершить
            </Button>
          )}
        </>
      }
    >
      {order && (
        <dl className={styles.details}>
          <div className={styles.row}>
            <dt>Адрес</dt>
            <dd>{order.address}</dd>
          </div>
          <div className={styles.row}>
            <dt>Дата</dt>
            <dd>{dayjs(order.scheduledAt).format("DD.MM.YYYY HH:mm")}</dd>
          </div>
          <div className={styles.row}>
            <dt>Статус</dt>
            <dd>
              <StatusTag status={order.status} />
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Описание</dt>
            <dd>{order.description}</dd>
          </div>
        </dl>
      )}
    </Modal>
  );
}
