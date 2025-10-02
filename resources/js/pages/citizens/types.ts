import type { BaseEntity } from '@/composables/useCrudOperations'
import type { CITIZEN_CUSTOM_ACTIONS } from './constants'
import type { Component } from 'vue'

// ส่วนอื่นๆคงเดิม - แค่อัปเดต interface ที่เกี่ยวข้องกับ icon
export interface Citizen extends BaseEntity {
  citizen_id: string | null
  birth_date: string | null
  remark?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CitizenFilters {
  search?: string
  birth_date_from?: string
  birth_date_to?: string
  created_from?: string
  created_to?: string
  has_remark?: boolean
  status?: string
}

// อัปเดต type สำหรับ Action Key
export type CitizenActionKey = typeof CITIZEN_CUSTOM_ACTIONS[number]['key']

export type CitizenSortField = 
  | 'id' 
  | 'citizen_id' 
  | 'birth_date' 
  | 'remark'
  | 'created_at' 
  | 'updated_at'

export interface CitizenCreateRequest {
  citizen_id: string
  birth_date?: string | null
  remark?: string | null
}

export interface CitizenUpdateRequest extends Partial<CitizenCreateRequest> {
  id: number
}

export interface CitizenState {
  isLoading: boolean
  selectedCitizens: Citizen[]
  filters: CitizenFilters
  expandedRows: Set<number>
  sortField?: CitizenSortField
  sortDirection?: 'asc' | 'desc'
}

export interface CitizenValidationErrors {
  citizen_id?: string[]
  birth_date?: string[]
  remark?: string[]
}

export type CitizenBulkAction = 
  | 'delete'
  | 'export'
  | 'print'
  | 'generateCards'

export interface CitizenBulkRequest {
  ids: number[]
  action: CitizenBulkAction
  options?: Record<string, any>
}

export interface CitizenExpandedField {
  key: keyof Citizen
  label: string
  formatter?: (value: any) => string
  className?: string
}

export interface CitizenColumnConfig {
  field: keyof Citizen
  header: string
  sortable?: boolean
  searchable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}
