import type { ReactNode } from "react";
import { cx } from "../cx";
import styles from "./Tag.module.css";

type TagColor = "blue" | "orange" | "green" | "gold" | "slate";

export function Tag({ color = "slate", children }: { color?: TagColor; children: ReactNode }) {
  return <span className={cx(styles.root, styles[color])}>{children}</span>;
}
