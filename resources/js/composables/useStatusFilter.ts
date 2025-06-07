// src/composables/useStatusFilter.ts
import { ref, computed, type Ref } from 'vue'
import type { Column } from '@tanstack/vue-table'

export interface StatusOption {
  value: string
  label: string
  count: number
}

export function useStatusFilter(column: Column<any, any>) {
  const selectedValues = ref<string[]>([])

  const facetedValues = computed((): StatusOption[] => {
    const facetedUniqueValues = column.getFacetedUniqueValues()
    const columnFilterValue = column.getFilterValue() as string[] || []
    
    return Array.from(facetedUniqueValues.entries())
      .map(([value, count]) => ({
        value,
        label: value,
        count
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  })

  const toggleValue = (value: string) => {
    const index = selectedValues.value.indexOf(value)
    if (index > -1) {
      selectedValues.value.splice(index, 1)
    } else {
      selectedValues.value.push(value)
    }
    
    // Update column filter
    const filterValue = selectedValues.value.length > 0 ? selectedValues.value : undefined
    column.setFilterValue(filterValue)
  }

  const clearFilter = () => {
    selectedValues.value = []
    column.setFilterValue(undefined)
  }

  const isFiltered = computed(() => selectedValues.value.length > 0)

  const selectedCount = computed(() => selectedValues.value.length)

  return {
    selectedValues,
    facetedValues,
    toggleValue,
    clearFilter,
    isFiltered,
    selectedCount
  }
}
