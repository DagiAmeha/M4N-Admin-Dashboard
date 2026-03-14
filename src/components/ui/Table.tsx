import { type ReactNode } from "react";

interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
}

export default function Table<T>({
  columns,
  data,
  loading,
  emptyMessage = "No data found",
  keyExtractor,
}: TableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-14 text-center text-sm text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={keyExtractor(row)}
                  className={`hover:bg-indigo-50/40 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={`px-4 py-3 align-top text-sm text-gray-700 ${col.className ?? ""}`}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
