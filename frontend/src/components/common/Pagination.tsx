import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, total, limit, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
      }}
    >
      <span>
        Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} results
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ opacity: page <= 1 ? 0.5 : 1 }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span style={{ fontWeight: 600, padding: '0 8px', color: 'var(--text-primary)' }}>
          Page {page} of {totalPages}
        </span>

        <button
          className="btn btn-secondary btn-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ opacity: page >= totalPages ? 0.5 : 1 }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
