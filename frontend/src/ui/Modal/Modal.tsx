import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../Button/Button";
import { cx } from "../cx";
import styles from "./Modal.module.css";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({ open, title, onClose, children, footer, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={cx(styles.dialog, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ui-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.head}>
          <h3 id="ui-modal-title">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            icon="close"
            className={styles.close}
            aria-label="Закрыть"
            onClick={onClose}
          />
        </div>
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.foot}>{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
