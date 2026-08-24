import { useEffect, useState, type ReactNode } from "react";
import { cx } from "../cx";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Table.module.css";

export type Column<T> = {
  key: string;
  title: string;
  width?: number | string;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  rows: T[];
  rowKey: (row: T) => string;
  columns: Column<T>[];
  loading?: boolean;
  empty?: string;
  pageSize?: number;
};

export function Ellipsis({ children }: { children: ReactNode }) {
  return <span className={styles.ellipsis}>{children}</span>;
}

export function Table<T>({
  rows,
  rowKey,
  columns,
  loading = false,
  empty = "Нет данных",
  pageSize,
}: Props<T>) {
  const [page, setPage] = useState(1);
  const total = rows.length;
  const pages = pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const slice = pageSize ? rows.slice((page - 1) * pageSize, page * pageSize) : rows;

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  const from = total === 0 || !pageSize ? 0 : (page - 1) * pageSize + 1;
  const to = pageSize ? Math.min(page * pageSize, total) : total;

  return (
    <div className={cx(styles.wrap, loading && styles.wrapLoading)}>
      {loading && (
        <div className={styles.loading}>
          <Spinner />
        </div>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slice.length === 0 && !loading ? (
            <tr>
              <td className={styles.empty} colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          ) : (
            slice.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pageSize && total > 0 && (
        <div className={styles.pagination}>
          <span>
            {from}–{to} из {total}
          </span>
          {pages > 1 && (
            <div className={styles.paginationBtns}>
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Назад
              </button>
              <span>
                {page} / {pages}
              </span>
              <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Далее
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
