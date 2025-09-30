import { ref, computed } from 'vue'
import { 
  useVueTable, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  getExpandedRowModel, 
  getFacetedRowModel, 
  getFacetedUniqueValues, 
  getFacetedMinMaxValues, 
  getGroupedRowModel 
} from '@tanstack/vue-table'
import { valueUpdater } from '@/lib/utils'
import { statusMultiSelectFilter, amountRangeFilter } from '@/lib/table-utils'
import { useToast } from './useToast'
import { useErrorHandler } from './useErrorHandler'
import { useServerOperations } from './useServerOperations'
import type { 
  TableConfig, 
  SortingState, 
  ColumnFiltersState, 
  VisibilityState, 
  ExpandedState, 
  GroupingState, 
  ColumnSizingState 
} from '@/types/table'

/**
 * Enhanced data table composable with integrated server operations
 * รองรับทั้ง client-side และ server-side operations
 */
export function useDataTable<T>(config: TableConfig<T>) {
  const { filterToast } = useToast()
  const { safeExecuteSync } = useErrorHandler()
  
  // Table states
  const sorting = ref<SortingState>([])
  const columnFilters = ref<ColumnFiltersState>([])
  const columnVisibility = ref<VisibilityState>({})
  const rowSelection = ref({})
  const expanded = ref<ExpandedState>({})
  const columnSizing = ref<ColumnSizingState>({})
  const grouping = ref<GroupingState>([])

  // Server operations (ถ้าเปิดใช้งาน)
  const serverOps = config.enableServerSide && config.routeName ? 
    useServerOperations({
      routeName: config.routeName,
      currentPage: config.currentPage || 1,
      totalPages: config.totalPages,
      perPage: config.perPage || 10,
      extra: {}
    }) : null

  // สร้าง table instance
  const table = useVueTable({
    get data() { return config.data },
    get columns() { return config.columns },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getGroupedRowModel: getGroupedRowModel(),
    
    // Feature flags
    enableColumnResizing: config.enableColumnResizing ?? true,
    enableColumnFilters: config.enableFiltering ?? true,
    enableGrouping: config.enableGrouping ?? true,
    enableSorting: config.enableSorting ?? true,
    
    // Configuration
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    groupedColumnMode: 'reorder',
    
    // Custom filter functions
    filterFns: {
      statusMultiSelect: statusMultiSelectFilter,
      amountRange: amountRangeFilter,
    },
    
    // State handlers
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
    onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
    onColumnSizingChange: updaterOrValue => valueUpdater(updaterOrValue, columnSizing),
    onGroupingChange: updaterOrValue => valueUpdater(updaterOrValue, grouping),
    
    // Current state
    state: {
      get sorting() { return sorting.value },
      get columnFilters() { return columnFilters.value },
      get columnVisibility() { return columnVisibility.value },
      get rowSelection() { return rowSelection.value },
      get expanded() { return expanded.value },
      get columnSizing() { return columnSizing.value },
      get grouping() { return grouping.value },
    },
  })

  // Utility functions
  const getColumnWidth = (columnId: string, defaultSize: number) => {
    return safeExecuteSync(
      () => columnSizing.value[columnId] || defaultSize,
      'เกิดข้อผิดพลาดในการดึงขนาดคอลัมน์'
    ) || defaultSize
  }

  const clearAllFilters = () => {
    safeExecuteSync(() => {
      table.resetColumnFilters()
      filterToast.cleared('ทั้งหมด')
    })
  }

  // Computed properties
  const activeFiltersCount = computed(() => {
    return safeExecuteSync(() => columnFilters.value.length) || 0
  })

  const activeGroupingCount = computed(() => {
    return safeExecuteSync(() => grouping.value.length) || 0
  })

  const selectedRowsCount = computed(() => {
    return safeExecuteSync(() => Object.keys(rowSelection.value).length) || 0
  })

  const totalRows = computed(() => {
    return safeExecuteSync(() => config.data.length) || 0
  })

  return {
    // Table instance
    table,
    
    // States
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    expanded,
    columnSizing,
    grouping,
    
    // Utility functions
    getColumnWidth,
    clearAllFilters,
    
    // Computed properties
    activeFiltersCount,
    activeGroupingCount,
    selectedRowsCount,
    totalRows,
    
    // Server operations (ถ้ามี)
    ...(serverOps || {})
  }
}
