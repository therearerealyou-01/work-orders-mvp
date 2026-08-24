import { useState, type InputHTMLAttributes } from "react";
import { cx } from "../cx";
import inputStyles from "../Input/Input.module.css";
import styles from "./Password.module.css";

export function Password({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.password}>
      <input
        className={cx(inputStyles.input, className)}
        type={visible ? "text" : "password"}
        {...rest}
      />

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
      >
        {visible ? "Скрыть" : "Показать"}
      </button>
    </div>
  );
}
