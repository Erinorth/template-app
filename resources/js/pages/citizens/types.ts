// ไฟล์: resources/js/pages/citizens/types.ts
import type { BaseEntity } from '@/composables/useCrudOperations'
import type { Component } from 'vue'

/**
 * Citizen Entity
 */
export interface Citizen extends BaseEntity {
  citizen_id: string | null
  birth_date: string | null
  remark?: string | null
  created_at?: string | null
  updated_at?: string | null
}

/**
 * Filters สำหรับการค้นหา Citizen
 */
export interface CitizenFilters {
  search?: string
  birth_date_from?: string
  birth_date_to?: string
  created_from?: string
  created_to?: string
  has_remark?: boolean
  status?: string
}

/**
 * Sort fields ที่รองรับ
 */
export type CitizenSortField = 
  | 'id' 
  | 'citizen_id' 
  | 'birth_date' 
  | 'remark'
  | 'created_at' 
  | 'updated_at'

/**
 * Request สำหรับสร้าง Citizen
 */
export interface CitizenCreateRequest {
  citizen_id: string
  birth_date?: string | null
  remark?: string | null
}

/**
 * Request สำหรับอัปเดต Citizen
 */
export interface CitizenUpdateRequest extends Partial<CitizenCreateRequest> {
  id: number
}

/**
 * State สำหรับ Citizen page
 */
export interface CitizenState {
  isLoading: boolean
  selectedCitizens: Citizen[]
  filters: CitizenFilters
  expandedRows: Set<number>
  sortField?: CitizenSortField
  sortDirection?: 'asc' | 'desc'
}

/**
 * Validation errors
 */
export interface CitizenValidationErrors {
  citizen_id?: string[]
  birth_date?: string[]
  remark?: string[]
}

/**
 * Bulk actions
 */
export type CitizenBulkAction = 
  | 'delete'
  | 'export'
  | 'print'
  | 'generateCards'

/**
 * Bulk action request
 */
export interface CitizenBulkRequest {
  ids: number[]
  action: CitizenBulkAction
  options?: Record<string, any>
}

/**
 * Expanded content field config
 */
export interface CitizenExpandedField {
  key: keyof Citizen
  label: string
  formatter?: (value: any) => string
  className?: string
}

/**
 * Column configuration
 */
export interface CitizenColumnConfig {
  field: keyof Citizen
  header: string
  sortable?: boolean
  searchable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}
