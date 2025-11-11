"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push("...");
      }
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      {/* Rows per page */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-[#888888]">Show</span>
        <div className="relative">
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="px-3 py-1.5 pr-8 border border-[#E7E7E7] rounded-lg bg-[#F1F0F2] text-[#0A438C] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0A438C] appearance-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <svg
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#888888] pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        <span className="text-[#888888]">Rows per page</span>
      </div>

      {/* Pagination - All controls in one container */}
      <div className="flex items-center bg-[#F1F0F2] rounded-lg px-2 py-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[#888888]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <span className="text-sm text-[#888888]">Prev</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center mx-2 space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors ${
                page === currentPage
                  ? "bg-[#0A438C] text-white"
                  : page === "..."
                  ? "text-[#888888] cursor-default"
                  : "text-[#888888] hover:opacity-70"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center space-x-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="text-sm text-[#888888]">Next</span>
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
            <svg
              className="w-4 h-4 text-[#888888]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

