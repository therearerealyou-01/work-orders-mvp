import type { SelectHTMLAttributes } from "react";
import { cx } from "../cx";
import inputStyles from "../Input/Input.module.css";
import styles from "./Select.module.css";

export type SelectOption = { value: string; label: string };

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> & {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: SelectOption[];
  placeholder?: string;
  allowClear?: boolean;
};

export function Select({
  value,
  onChange,
  options,
  placeholder,
  allowClear = false,
  className,
  ...rest
}: SelectProps) {
  return (
    <select
      className={cx(inputStyles.input, styles.select, className)}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
      {...rest}
    >
      {(placeholder || allowClear) && (
        <option value="" disabled={!allowClear}>
          {placeholder ?? "—"}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
