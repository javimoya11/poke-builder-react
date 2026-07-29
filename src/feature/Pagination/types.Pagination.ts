export interface IPagination {
  /** 1-indexed current page. */
  page: number;
  /** Total number of items across all pages. */
  totalItems: number;
  /** Number of items shown per page. */
  pageSize: number;
  onPageChange: (page: number) => void;
}
