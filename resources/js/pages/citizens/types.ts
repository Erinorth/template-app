// resources/js/pages/citizens/types.ts
export type Citizen = {
  id: number
  citizen_id: string | null
  birth_date: string | null
  remark?: string | null
  created_at?: string | null
  updated_at?: string | null
}

// เพิ่ม types อื่นๆ ที่เกี่ยวข้อง
export type CitizenFilters = {
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
