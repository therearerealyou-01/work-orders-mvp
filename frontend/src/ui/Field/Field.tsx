import type { ReactNode } from "react";
import styles from "./Field.module.css";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className={styles.root}>
      <span className={styles.label}>{label}</span>

      {children}

      {error ? <span className={styles.error}>{error}</span> : null}
    </label>
  );
}
