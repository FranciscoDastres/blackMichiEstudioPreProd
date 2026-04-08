import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-border hover:border-primary disabled:opacity-40 transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        if (
          page === 1 ||
          page === totalPages ||
          Math.abs(page - currentPage) <= 1
        ) {
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                page === currentPage
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary text-foreground"
              }`}
            >
              {page}
            </button>
          );
        }
        if (Math.abs(page - currentPage) === 2) {
          return (
            <span key={page} className="text-muted text-sm">
              …
            </span>
          );
        }
        return null;
      })}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-border hover:border-primary disabled:opacity-40 transition-colors"
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
