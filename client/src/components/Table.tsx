import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
  /** Dense drops the outer card and shrinks spacing, for tables nested inside a Modal. */
  dense?: boolean;
}

export default function Table<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records found',
  dense = false
}: TableProps<T>) {
  const wrapperClass = dense ? '' : 'bg-white rounded-lg shadow-md overflow-hidden';
  const cellClass = dense ? 'py-1' : 'px-6 py-4 whitespace-nowrap';
  const headClass = dense
    ? 'text-left py-1 font-medium'
    : 'px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider';

  return (
    <div className={wrapperClass}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={dense ? '' : 'bg-panel'}>
            <tr className={dense ? 'border-b border-line' : ''}>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${headClass} ${column.align === 'right' ? 'text-right' : ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={dense ? '' : 'divide-y divide-line'}>
            {rows.map((row) => (
              <tr key={rowKey(row)} className={dense ? 'border-b border-line' : 'hover:bg-panel'}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`${cellClass} ${column.align === 'right' ? 'text-right' : ''}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <div className="text-center py-8 text-slate-500">{emptyMessage}</div>
      )}
    </div>
  );
}