import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './Pagination.module.css';
import { IPagination } from './types.Pagination';

export const Pagination = ({
  page,
  totalItems,
  pageSize,
  onPageChange
}: IPagination) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.pagination}>
      <span className={styles.rangeInfo}>
        {rangeStart}-{rangeEnd} of {totalItems}
      </span>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="First page"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Previous page"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft size={16} />
        </button>

        <span className={styles.pageLabel}>Page</span>
        <select
          className={styles.pageSelect}
          aria-label="Current page"
          value={page}
          onChange={(e) => onPageChange(Number(e.target.value))}
        >
          {pages.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <span className={styles.pageLabel}>of {totalPages}</span>

        <button
          type="button"
          className={styles.navButton}
          aria-label="Next page"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Last page"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};
