// resources/js/types/table.ts
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
import type { Ref, ComputedRef } from 'vue'

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

// เพิ่ม type alias เพื่อให้ง่ายต่อการใช้งานและ backward compatibility
export type TableColumn<T> = ColumnDef<T>

// Helper types สำหรับ reactive values
export type MaybeRef<T> = T | Ref<T>
export type MaybeRefOrGetter<T> = T | Ref<T> | ComputedRef<T> | (() => T)

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

// Server-side operation types - ปรับให้รองรับ reactive values
export interface ServerOperationConfig {
  routeName: string
  currentPage: MaybeRefOrGetter<number>
  totalPages?: MaybeRefOrGetter<number>
  perPage: MaybeRefOrGetter<number>
  sort?: MaybeRefOrGetter<string>
  direction?: MaybeRefOrGetter<'asc' | 'desc'>
  extra?: MaybeRefOrGetter<Record<string, any>>
  replace?: boolean
}

// Toast message types
export interface ToastConfig {
  success: string
  error: string
  info: string
  loading: string
}
