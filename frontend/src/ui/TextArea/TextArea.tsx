import type { TextareaHTMLAttributes } from "react";
import { cx } from "../cx";
import inputStyles from "../Input/Input.module.css";
import styles from "./TextArea.module.css";

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(inputStyles.input, styles.textarea, className)} {...rest} />;
}
