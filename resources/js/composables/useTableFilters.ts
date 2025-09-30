import { ref, computed, watch } from 'vue'
import type { Column } from '@tanstack/vue-table'
import { toast } from 'vue-sonner'

// Generic types สำหรับการกรอง
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
}

/**
 * Generic composable สำหรับกรองข้อมูลแบบ Multi-Select (เลือกหลายตัวเลือก)
 * สามารถใช้กับข้อมูลประเภทใดก็ได้ เช่น status, category, priority เป็นต้น
 * 
 * @template TData - ประเภทข้อมูลของแถวในตาราง
 * @param column - Column ที่ต้องการกรอง
 * @param labelMapping - การแมปค่าเป็นป้ายกำกับ (ถ้าไม่ระบุจะใช้ค่าตัวอักษรตัวแรกเป็นตัวใหญ่)
 * @param config - การตั้งค่าข้อความแจ้งเตือน
 */
export function useMultiSelectFilter<TData = any>(
  column: Column<TData, any>,
  labelMapping?: Record<string, string>,
  config: FilterConfig = {
    successMessage: 'กรองข้อมูล',
    clearMessage: 'ยกเลิกการกรองข้อมูล'
  }
) {
  const selectedValues = ref<string[]>([])
  
  // เฝ้าติดตามการเปลี่ยนแปลงค่ากรองจาก column
  watch(() => column.getFilterValue(), (newValue) => {
    if (Array.isArray(newValue)) {
      selectedValues.value = [...newValue]
    } else {
      selectedValues.value = []
    }
  }, { immediate: true })
  
  // คำนวณตัวเลือกที่มีอยู่พร้อมจำนวน
  const facetedValues = computed((): OptionFilter[] => {
    try {
      const uniqueValues = column.getFacetedUniqueValues()
      if (uniqueValues && uniqueValues.size > 0) {
        return Array.from(uniqueValues.entries()).map(([value, count]: [string, number]) => ({
          value: value as string,
          label: getLabel(value as string),
          count: count as number
        })).sort((a, b) => a.label.localeCompare(b.label))
      } else {
        // ถ้าไม่มีข้อมูลให้แสดงตัวเลือกเริ่มต้นจาก labelMapping
        if (labelMapping) {
          return Object.entries(labelMapping).map(([value, label]) => ({
            value,
            label,
            count: 0
          }))
        }
        return []
      }
    } catch (error) {
      console.warn('เกิดข้อผิดพลาดในการดึงข้อมูลตัวเลือก:', error)
      return labelMapping ? Object.entries(labelMapping).map(([value, label]) => ({
        value,
        label,
        count: 0
      })) : []
    }
  })

  // ฟังก์ชันแปลงค่าเป็นป้ายกำกับ
  const getLabel = (value: string): string => {
    if (labelMapping && labelMapping[value]) {
      return labelMapping[value]
    }
    // ถ้าไม่มี mapping ให้ใช้ค่าเริ่มต้น (ตัวแรกเป็นตัวใหญ่)
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
  
  // ฟังก์ชันเพิ่ม/ลบตัวเลือก
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
    
    // แสดงข้อความแจ้งเตือน
    if (currentValues.length > 0) {
      const selectedLabels = currentValues.map(v => getLabel(v)).join(', ')
      toast.success(`${config.successMessage}: ${selectedLabels}`)
    } else {
      toast.info(config.clearMessage)
    }
  }

  // ฟังก์ชันล้างการกรองทั้งหมด
  const clearFilter = () => {
    selectedValues.value = []
    column.setFilterValue(undefined)
    toast.info(config.clearMessage)
  }

  return {
    selectedValues,
    facetedValues,
    toggleValue,
    clearFilter,
    getLabel
  }
}

/**
 * Generic composable สำหรับกรองข้อมูลแบบช่วง (Range Filter)
 * สามารถใช้กับข้อมูลตัวเลขประเภทใดก็ได้ เช่น ราคา, อายุ, คะแนน เป็นต้น
 * 
 * @template TData - ประเภทข้อมูลของแถวในตาราง
 * @param column - Column ที่ต้องการกรอง
 * @param config - การตั้งค่าข้อความแจ้งเตือนและหน่วย
 */
export function useRangeFilter<TData = any>(
  column: Column<TData, any>,
  config: FilterConfig & { 
    unit?: string
    defaultMin?: number
    defaultMax?: number 
  } = {
    successMessage: 'กรองช่วงข้อมูล',
    clearMessage: 'ล้างการกรองช่วงข้อมูล',
    unit: '',
    defaultMin: 0,
    defaultMax: 1000
  }
) {
  const filterValue = ref<RangeFilter>(column.getFilterValue() as RangeFilter || {})
  
  // คำนวณค่าต่ำสุดและสูงสุดจากข้อมูล
  const facetedMinMax = computed(() => {
    try {
      const minMax = column.getFacetedMinMaxValues()
      return minMax ? [minMax[0], minMax[1]] : [config.defaultMin || 0, config.defaultMax || 1000]
    } catch (error) {
      console.warn('เกิดข้อผิดพลาดในการคำนวณค่าต่ำสุด-สูงสุด:', error)
      return [config.defaultMin || 0, config.defaultMax || 1000]
    }
  })
  
  // ฟังก์ชันอัปเดตการกรอง
  const updateFilter = () => {
    const hasValues = filterValue.value.min !== undefined || filterValue.value.max !== undefined
    column.setFilterValue(hasValues ? { ...filterValue.value } : undefined)
    
    // แสดงข้อความแจ้งเตือน
    if (hasValues) {
      const minDisplay = filterValue.value.min || 0
      const maxDisplay = filterValue.value.max ? filterValue.value.max : 'ไม่จำกัด'
      const unit = config.unit || ''
      toast.success(`${config.successMessage}: ${minDisplay}${unit} - ${maxDisplay}${unit}`)
    }
  }

  // ฟังก์ชันล้างการกรอง
  const clearFilter = () => {
    filterValue.value = {}
    column.setFilterValue(undefined)
    toast.info(config.clearMessage)
  }

  // ตรวจสอบว่ามีการกรองหรือไม่
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

/**
 * Generic composable สำหรับกรองข้อมูลแบบ Autocomplete
 * สามารถใช้กับฟิลด์ข้อความประเภทใดก็ได้ เช่น ชื่อ, อีเมล, ที่อยู่ เป็นต้น
 * 
 * @template TData - ประเภทข้อมูลของแถวในตาราง  
 * @param column - Column ที่ต้องการกรอง
 * @param config - การตั้งค่าข้อความแจ้งเตือน
 * @param maxSuggestions - จำนวนข้อเสนอแนะสูงสุด (ค่าเริ่มต้น 10)
 */
export function useAutocompleteFilter<TData = any>(
  column: Column<TData, any>,
  config: FilterConfig = {
    successMessage: 'กรองข้อมูล',
    clearMessage: 'ล้างการกรองข้อมูล'
  },
  maxSuggestions: number = 10
) {
  const open = ref(false)
  const inputValue = ref(column.getFilterValue() as string || '')
  
  // คำนวณข้อเสนอแนะจากข้อมูล
  const suggestions = computed((): AutocompleteSuggestion[] => {
    try {
      const uniqueValues = column.getFacetedUniqueValues()
      return Array.from(uniqueValues.entries())
        .map(([value, count]: [string, number]) => ({ 
          value: value as string, 
          count: count as number 
        }))
        .filter((item: AutocompleteSuggestion) => 
          inputValue.value === '' || 
          item.value.toLowerCase().includes(inputValue.value.toLowerCase())
        )
        .sort((a: AutocompleteSuggestion, b: AutocompleteSuggestion) => b.count - a.count)
        .slice(0, maxSuggestions)
    } catch (error) {
      console.warn('เกิดข้อผิดพลาดในการดึงข้อเสนอแนะ:', error)
      return []
    }
  })

  // ฟังก์ชันเลือกค่าจากข้อเสนอแนะ
  const selectValue = (value: string) => {
    inputValue.value = value
    column.setFilterValue(value)
    open.value = false
    toast.success(`${config.successMessage}: ${value}`)
  }

  // ฟังก์ชันอัปเดตค่ากรองจากการพิมพ์
  const updateFilter = (value: string) => {
    inputValue.value = value
    column.setFilterValue(value || undefined)
    
    if (value) {
      toast.success(`${config.successMessage}: ${value}`)
    }
  }

  // ฟังก์ชันล้างการกรอง
  const clearFilter = () => {
    inputValue.value = ''
    column.setFilterValue(undefined)
    open.value = false
    toast.info(config.clearMessage)
  }

  return {
    open,
    inputValue,
    suggestions,
    selectValue,
    updateFilter,
    clearFilter
  }
}

/**
 * Generic composable สำหรับกรองข้อมูลแบบ Boolean (เช่น เปิด/ปิด, ใช่/ไม่ใช่)
 * 
 * @template TData - ประเภทข้อมูลของแถวในตาราง
 * @param column - Column ที่ต้องการกรอง
 * @param labels - ป้ายกำกับสำหรับ true/false
 * @param config - การตั้งค่าข้อความแจ้งเตือน
 */
export function useBooleanFilter<TData = any>(
  column: Column<TData, any>,
  labels: { true: string; false: string } = { true: 'ใช่', false: 'ไม่ใช่' },
  config: FilterConfig = {
    successMessage: 'กรองข้อมูล',
    clearMessage: 'ล้างการกรองข้อมูล'
  }
) {
  const selectedValue = ref<boolean | null>(column.getFilterValue() as boolean | null || null)
  
  // เฝ้าติดตามการเปลี่ยนแปลงค่ากรองจาก column
  watch(() => column.getFilterValue(), (newValue) => {
    selectedValue.value = newValue as boolean | null
  }, { immediate: true })
  
  // ตัวเลือกที่มีอยู่
  const options = computed(() => [
    { value: true, label: labels.true },
    { value: false, label: labels.false }
  ])

  // ฟังก์ชันเลือกค่า
  const selectValue = (value: boolean | null) => {
    selectedValue.value = value
    column.setFilterValue(value)
    
    if (value !== null) {
      const label = value ? labels.true : labels.false
      toast.success(`${config.successMessage}: ${label}`)
    } else {
      toast.info(config.clearMessage)
    }
  }

  // ฟังก์ชันล้างการกรอง
  const clearFilter = () => {
    selectedValue.value = null
    column.setFilterValue(undefined)
    toast.info(config.clearMessage)
  }

  return {
    selectedValue,
    options,
    selectValue,
    clearFilter
  }
}
