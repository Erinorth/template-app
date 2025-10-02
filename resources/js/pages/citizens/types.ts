import type { BaseEntity } from '@/composables/useCrudOperations'

// ใช้ interface แทน type และขยายจาก BaseEntity
export interface Citizen extends BaseEntity {
  citizen_id: string | null
  birth_date: string | null
  remark?: string | null
  created_at?: string | null
  updated_at?: string | null
}

// เพิ่ม types อื่นๆ ที่เกี่ยวข้อง
export interface CitizenFilters {
  search?: string
  birth_date_from?: string
  birth_date_to?: string
  created_from?: string
  created_to?: string
}

export type CitizenActionKey = 
  | 'generateCard' 
  | 'viewHistory' 
  | 'print' 
  | 'export'

export type CitizenSortField = 
  | 'id' 
  | 'citizen_id' 
  | 'birth_date' 
  | 'created_at' 
  | 'updated_at'

// เพิ่ม type สำหรับ API responses
export interface CitizenCreateRequest {
  citizen_id: string
  birth_date?: string | null
  remark?: string | null
}

export interface CitizenUpdateRequest extends Partial<CitizenCreateRequest> {
  id: number
}

// เพิ่ม type สำหรับการจัดการ state
export interface CitizenState {
  isLoading: boolean
  selectedCitizens: Citizen[]
  filters: CitizenFilters
}
