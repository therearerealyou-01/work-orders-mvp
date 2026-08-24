import { useSyncExternalStore } from "react";
import { cx } from "../cx";
import styles from "./Toast.module.css";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; title: string; description?: string };

let nextId = 1;
let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function dismiss(id: number) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

function push(kind: ToastKind, title: string, description?: string) {
  const id = nextId++;
  toasts = [...toasts, { id, kind, title, description }];
  emit();
  window.setTimeout(() => dismiss(id), description ? 6000 : 4000);
}

export const toast = {
  success(title: string, description?: string) {
    push("success", title, description);
  },
  error(title: string, description?: string) {
    push("error", title, description);
  },
  info(title: string, description?: string) {
    push("info", title, description);
  },
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function ToastHost() {
  const items = useSyncExternalStore(
    subscribe,
    () => toasts,
    () => toasts
  );

  if (items.length === 0) return null;

  return (
    <div className={styles.host} aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={cx(styles.toast, styles[item.kind])}>
          <div>
            <strong>{item.title}</strong>
            {item.description ? <p>{item.description}</p> : null}
          </div>
          <button type="button" className={styles.close} onClick={() => dismiss(item.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
