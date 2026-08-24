import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../cx";
import { Icon, type IconName } from "../Icon/Icon";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  icon?: IconName;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  icon,
  className,
  disabled,
  type = "button",
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cx(
        styles.root,
        styles[variant],
        styles[size],
        block && styles.block,
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden />
      ) : icon ? (
        <Icon name={icon} size={16} />
      ) : null}

      {children ? <span>{children}</span> : null}
    </button>
  );
}
