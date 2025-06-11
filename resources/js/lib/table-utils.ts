import type { FilterFn } from '@tanstack/vue-table'
import type { Payment, AmountFilter } from '@/types/payment'

// Helper functions สำหรับจัดการ row states อย่างปลอดภัย
export function safeGetIsGrouped(row: any): boolean {
  try {
    return row.getIsGrouped && typeof row.getIsGrouped === 'function' ? row.getIsGrouped() : false
  } catch {
    return false
  }
}

export function safeGetIsAggregated(row: any): boolean {
  try {
    return row.getIsAggregated && typeof row.getIsAggregated === 'function' ? row.getIsAggregated() : false
  } catch {
    return false
  }
}

export function safeGetSubRows(row: any): any[] {
  try {
    return row.subRows || []
  } catch {
    return []
  }
}

// Filter functions ที่ปรับปรุงแล้ว - ลบ console.log ซ้ำซ้อน
export const statusMultiSelectFilter: FilterFn<Payment> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
    return true
  }
  
  const cellValue = row.getValue(columnId) as string
  return filterValue.includes(cellValue)
}

export const amountRangeFilter: FilterFn<Payment> = (row, columnId, filterValue: AmountFilter) => {
  if (!filterValue) return true
  const cellValue = Number.parseFloat(row.getValue(columnId) as string)
  if (filterValue.min !== undefined && cellValue < filterValue.min) return false
  if (filterValue.max !== undefined && cellValue > filterValue.max) return false
  return true
}
