import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onChange: (page: number) => void;
}

export default function Pagination({
  page,
  pages,
  total,
  onChange,
}: PaginationProps) {
  // Hide pagination if total is less than 20
  if (total < 20 || pages <= 1) return null;

  const pageItems: Array<number | string> = [];
  if (pages <= 7) {
    for (let i = 1; i <= pages; i += 1) pageItems.push(i);
  } else {
    const start = Math.max(2, page - 1);
    const end = Math.min(pages - 1, page + 1);

    pageItems.push(1);
    if (start > 2) pageItems.push("left-ellipsis");

    for (let i = start; i <= end; i += 1) {
      pageItems.push(i);
    }

    if (end < pages - 1) pageItems.push("right-ellipsis");
    pageItems.push(pages);
  }

  return (
    <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs sm:text-sm">{total} total</span>
      <div className="flex flex-wrap items-center gap-1">
        {/* Previous button: disabled on first page */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        {pageItems.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              onClick={() => onChange(item)}
              className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium ${
                item === page ? "bg-indigo-600 text-white" : "hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="px-1 text-xs text-gray-400">
              ...
            </span>
          ),
        )}
        {/* Next button: disabled on last page */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
