import { ref, computed, watch } from 'vue'
import type { Column } from '@tanstack/vue-table'
import type { Payment, StatusOption, EmailSuggestion, AmountFilter } from '@/types/payment'
import { toast } from 'vue-sonner'

// ใช้ function เดียวจาก useTableFilters.ts แทนการมีไฟล์แยก
export function useStatusFilter(column: Column<Payment, any>) {
  const selectedValues = ref<string[]>([])
  
  // Watch column filter changes
  watch(() => column.getFilterValue(), (newValue) => {
    if (Array.isArray(newValue)) {
      selectedValues.value = [...newValue]
    } else {
      selectedValues.value = []
    }
  }, { immediate: true })
  
  const facetedValues = computed((): StatusOption[] => {
    try {
      const uniqueValues = column.getFacetedUniqueValues()
      if (uniqueValues && uniqueValues.size > 0) {
        return Array.from(uniqueValues.entries()).map(([value, count]: [string, number]) => ({
          value: value as string,
          label: getStatusLabel(value as string),
          count: count as number
        })).sort((a, b) => a.label.localeCompare(b.label))
      } else {
        return [
          { value: 'pending', label: 'รอดำเนินการ', count: 0 },
          { value: 'processing', label: 'กำลังประมวลผล', count: 0 },
          { value: 'success', label: 'สำเร็จ', count: 0 },
          { value: 'failed', label: 'ล้มเหลว', count: 0 },
        ]
      }
    } catch (error) {
      console.warn('Error getting faceted values:', error)
      return [
        { value: 'pending', label: 'รอดำเนินการ', count: 0 },
        { value: 'processing', label: 'กำลังประมวลผล', count: 0 },
        { value: 'success', label: 'สำเร็จ', count: 0 },
        { value: 'failed', label: 'ล้มเหลว', count: 0 },
      ]
    }
  })

  // Helper function สำหรับแปลง status เป็นภาษาไทย
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'รอดำเนินการ',
      processing: 'กำลังประมวลผล',
      success: 'สำเร็จ',
      failed: 'ล้มเหลว'
    }
    return labels[status] || status.charAt(0).toUpperCase() + status.slice(1)
  }
  
  const toggleValue = (value: string) => {
    const currentValues = [...selectedValues.value]
    const index = currentValues.indexOf(value)
    
    if (index > -1) {
      currentValues.splice(index, 1)
    } else {
      currentValues.push(value)
    }
    
    selectedValues.value = currentValues
    const filterValue = currentValues.length > 0 ? currentValues : undefined
    column.setFilterValue(filterValue)
    
    if (currentValues.length > 0) {
      toast.success(`กรองสถานะ: ${currentValues.map(v => getStatusLabel(v)).join(', ')}`)
    } else {
      toast.info('ยกเลิกการกรองสถานะ')
    }
  }

  const clearFilter = () => {
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
