import { ref, computed } from 'vue'
import { useVueTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, getExpandedRowModel, getFacetedRowModel, getFacetedUniqueValues, getFacetedMinMaxValues, getGroupedRowModel } from '@tanstack/vue-table'
import { valueUpdater } from '@/lib/utils'
import { statusMultiSelectFilter, amountRangeFilter } from '@/lib/table-utils'
import type { TableConfig, SortingState, ColumnFiltersState, VisibilityState, ExpandedState, GroupingState, ColumnSizingState } from '@/types/table'
import { toast } from 'vue-sonner'

// Composable สำหรับจัดการ Data Table
export function useDataTable<T>(config: TableConfig<T>) {
  // State management
  const sorting = ref<SortingState>([])
  const columnFilters = ref<ColumnFiltersState>([])
  const columnVisibility = ref<VisibilityState>({})
  const rowSelection = ref({})
  const expanded = ref<ExpandedState>({})
  const columnSizing = ref<ColumnSizingState>({})
  const grouping = ref<GroupingState>([])

  // การตั้งค่าตาราง
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
    enableColumnResizing: config.enableColumnResizing ?? true,
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    enableColumnFilters: config.enableFiltering ?? true,
    enableGrouping: config.enableGrouping ?? true,
    groupedColumnMode: 'reorder',
    filterFns: {
      statusMultiSelect: statusMultiSelectFilter,
      amountRange: amountRangeFilter,
    },
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
    onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
    onColumnSizingChange: updaterOrValue => valueUpdater(updaterOrValue, columnSizing),
    onGroupingChange: updaterOrValue => valueUpdater(updaterOrValue, grouping),
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

  // ฟังก์ชันช่วยเหลือ
  const getColumnWidth = (columnId: string, defaultSize: number) => {
    return columnSizing.value[columnId] || defaultSize
  }

  const clearAllFilters = () => {
    try {
      table.resetColumnFilters()
      toast.info('ล้างตัวกรองทั้งหมดแล้ว')
    } catch (error) {
      console.warn('Clear filters failed:', error)
    }
  }

  // Computed properties
  const activeFiltersCount = computed(() => {
    try {
      return columnFilters.value.length
    } catch {
      return 0
    }
  })

  const activeGroupingCount = computed(() => {
    try {
      return grouping.value.length
    } catch {
      return 0
    }
  })

  return {
    table,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    expanded,
    columnSizing,
    grouping,
    getColumnWidth,
    clearAllFilters,
    activeFiltersCount,
    activeGroupingCount
  }
}
