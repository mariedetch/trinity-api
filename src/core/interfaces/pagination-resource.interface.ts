export interface PaginationResource<T> {
  currentPage: number;
  perPage: number;
  total: number;
  items: T[];
}
