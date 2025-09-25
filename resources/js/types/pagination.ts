// resources/js/types/pagination.ts
export type PaginationLink = {
  url: string | null
  label: string
  active: boolean
}

export type LengthAwarePaginator<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
  links: PaginationLink[]
}

export type ServerPaginationProps = {
  total: number
  currentPage: number
  totalPages: number
  pageSize: number
  from: number | null
  to: number | null
  pageSizeOptions?: number[]
  links?: PaginationLink[]
}
