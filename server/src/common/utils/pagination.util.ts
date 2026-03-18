import { ResponseMeta } from '@common/interceptors/transform.interceptor';

export interface PaginatedResult<T> {
  items: T[];
  meta: ResponseMeta;
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
