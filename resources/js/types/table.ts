import type { 
  ColumnDef, 
  SortingState, 
  ColumnFiltersState,
  VisibilityState,
  ExpandedState,
  GroupingState,
  ColumnSizingState,
  FilterFn,
  Column
} from '@tanstack/vue-table'

// Export table types สำหรับใช้งานทั่วไป
export type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ExpandedState,
  GroupingState,
  ColumnSizingState,
  FilterFn,
  Column
}

// Interface สำหรับ Table Configuration
export interface TableConfig<T> {
  columns: ColumnDef<T>[]
  data: T[]
  enableSorting?: boolean
  enableFiltering?: boolean
  enableGrouping?: boolean
  enableColumnResizing?: boolean
}
