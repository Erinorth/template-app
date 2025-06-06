import { ref, computed, watch } from 'vue'
import type { Column } from '@tanstack/vue-table'
import type { Payment, StatusOption, EmailSuggestion, AmountFilter } from '@/types/payment'
import { toast } from 'vue-sonner'

// Composable สำหรับจัดการ Status Filter
export function useStatusFilter(column: Column<Payment, any>) {
  const selectedValues = ref<string[]>([])
  
  // ใช้ watch แทน onMounted เพื่อหลีกเลี่ยง lifecycle issue
  watch(() => column.getFilterValue(), (newValue) => {
    if (Array.isArray(newValue)) {
      selectedValues.value = [...newValue]
    } else {
      selectedValues.value = []
    }
    console.log('Column filter changed to:', selectedValues.value)
  }, { immediate: true })
  
  // ปรับปรุง faceted values ให้แสดงผลดีขึ้น
  const facetedValues = computed((): StatusOption[] => {
    try {
      const uniqueValues = column.getFacetedUniqueValues()
      if (uniqueValues && uniqueValues.size > 0) {
        return Array.from(uniqueValues.entries()).map(([value, count]: [string, number]) => ({
          value: value as string,
          label: (value as string).charAt(0).toUpperCase() + (value as string).slice(1),
          count: count as number
        })).sort((a, b) => a.label.localeCompare(b.label))
      } else {
        // Fallback ถ้าไม่มี faceted values
        return [
          { value: 'pending', label: 'Pending', count: 0 },
          { value: 'processing', label: 'Processing', count: 0 },
          { value: 'success', label: 'Success', count: 0 },
          { value: 'failed', label: 'Failed', count: 0 },
        ]
      }
    } catch (error) {
      console.warn('Error getting faceted values:', error)
      return [
        { value: 'pending', label: 'Pending', count: 0 },
        { value: 'processing', label: 'Processing', count: 0 },
        { value: 'success', label: 'Success', count: 0 },
        { value: 'failed', label: 'Failed', count: 0 },
      ]
    }
  })
  
  const toggleValue = (value: string) => {
    console.log('Toggle value called:', value)
    
    const currentValues = [...selectedValues.value]
    const index = currentValues.indexOf(value)
    
    if (index > -1) {
      currentValues.splice(index, 1)
    } else {
      currentValues.push(value)
    }
    
    selectedValues.value = currentValues
    
    const filterValue = currentValues.length > 0 ? currentValues : undefined
    console.log('Setting filter value:', filterValue)
    
    column.setFilterValue(filterValue)
    
    if (currentValues.length > 0) {
      toast.success(`กรองสถานะ: ${currentValues.join(', ')}`)
    } else {
      toast.info('ยกเลิกการกรองสถานะ')
    }
  }

  const clearFilter = () => {
    console.log('Clear filter called')
    selectedValues.value = []
    column.setFilterValue(undefined)
    toast.info('ล้างการกรองสถานะทั้งหมด')
  }

  return {
    selectedValues,
    facetedValues,
    toggleValue,
    clearFilter
  }
}

// Composable สำหรับจัดการ Amount Range Filter
export function useAmountRangeFilter(column: Column<Payment, any>) {
  const filterValue = ref<AmountFilter>(column.getFilterValue() as AmountFilter || {})
  
  const facetedMinMax = computed(() => {
    try {
      const minMax = column.getFacetedMinMaxValues()
      return minMax ? [minMax[0], minMax[1]] : [0, 1000]
    } catch {
      return [0, 1000]
    }
  })
  
  const updateFilter = () => {
    const hasValues = filterValue.value.min !== undefined || filterValue.value.max !== undefined
    column.setFilterValue(hasValues ? { ...filterValue.value } : undefined)
    
    if (hasValues) {
      toast.success(`กรองจำนวน: $${filterValue.value.min || 0} - $${filterValue.value.max || 'ไม่จำกัด'}`)
    }
  }

  const clearFilter = () => {
    filterValue.value = {}
    column.setFilterValue(undefined)
    toast.info('ล้างการกรองจำนวนเงิน')
  }

  const hasFilter = computed(() => {
    return filterValue.value.min !== undefined || filterValue.value.max !== undefined
  })

  return {
    filterValue,
    facetedMinMax,
    updateFilter,
    clearFilter,
    hasFilter
  }
}

// Composable สำหรับจัดการ Email Autocomplete Filter
export function useEmailAutocompleteFilter(column: Column<Payment, any>) {
  const open = ref(false)
  const inputValue = ref(column.getFilterValue() as string || '')
  
  const emailSuggestions = computed((): EmailSuggestion[] => {
    try {
      const uniqueValues = column.getFacetedUniqueValues()
      return Array.from(uniqueValues.entries())
        .map(([value, count]: [string, number]) => ({ 
          value: value as string, 
          count: count as number 
        }))
        .filter((item: EmailSuggestion) => 
          inputValue.value === '' || 
          item.value.toLowerCase().includes(inputValue.value.toLowerCase())
        )
        .sort((a: EmailSuggestion, b: EmailSuggestion) => b.count - a.count)
        .slice(0, 10)
    } catch {
      return []
    }
  })

  const selectEmail = (email: string) => {
    inputValue.value = email
    column.setFilterValue(email)
    open.value = false
    toast.success(`กรองอีเมล: ${email}`)
  }

  const clearFilter = () => {
    inputValue.value = ''
    column.setFilterValue('')
    toast.info('ล้างการกรองอีเมล')
  }

  return {
    open,
    inputValue,
    emailSuggestions,
    selectEmail,
    clearFilter
  }
}
