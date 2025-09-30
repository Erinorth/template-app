// ปรับปรุงให้รวม types ที่เกี่ยวข้องกับ table ทั้งหมด
import type { 
  ColumnDef, 
  SortingState, 
  ColumnFiltersState,
  VisibilityState,
  ExpandedState,
  GroupingState,
  ColumnSizingState,
  FilterFn,
  Column,
  Table
} from '@tanstack/vue-table'

// Re-export types สำหรับใช้งานง่าย
export type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ExpandedState,
  GroupingState,
  ColumnSizingState,
  FilterFn,
  Column,
  Table
}

// Extended types สำหรับ application
export interface TableConfig<T> {
  columns: ColumnDef<T>[]
  data: T[]
  enableSorting?: boolean
  enableFiltering?: boolean
  enableGrouping?: boolean
  enableColumnResizing?: boolean
  enableServerSide?: boolean
  routeName?: string
  currentPage?: number
  totalPages?: number
  perPage?: number
}

// Filter-related types
export interface OptionFilter {
  value: string
  label: string
  count: number
}

export interface RangeFilter {
  min?: number
  max?: number
}

export interface AutocompleteSuggestion {
  value: string
  count: number
}

export interface FilterConfig {
  successMessage: string
  clearMessage: string
  noFilterMessage?: string
  unit?: string
  defaultMin?: number
  defaultMax?: number
}

// Server-side operation types
export interface ServerOperationConfig {
  routeName: string
  currentPage: number
  totalPages?: number
  perPage: number
  sort?: string
  direction?: 'asc' | 'desc'
  extra?: Record<string, any>
  replace?: boolean
}

// Toast message types
export interface ToastConfig {
  success: string
  error: string
  info: string
  loading: string
}
