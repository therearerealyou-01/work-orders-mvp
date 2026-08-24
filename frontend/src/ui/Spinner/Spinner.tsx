import styles from "./Spinner.module.css";

export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <span
      className={styles.root}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Загрузка"
    />
  );
}

export function CenteredSpinner() {
  return (
    <div className={styles.centered}>
      <Spinner />
    </div>
  );
}
