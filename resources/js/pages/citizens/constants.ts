// นำเข้า icons จาก lucide-vue-next
import { 
  CreditCard, 
  History, 
  Printer, 
  FileSpreadsheet
} from 'lucide-vue-next'
// นำเข้า Component type จาก Vue
import type { Component } from 'vue'

// ส่วนกำหนด custom actions สำหรับประชาชน
export const CITIZEN_CUSTOM_ACTIONS = [
  { 
    key: 'generateCard', 
    label: 'สร้างบัตร', 
    separator: true,
    icon: CreditCard 
  },
  { 
    key: 'viewHistory', 
    label: 'ดูประวัติ',
    icon: History
  },
  { 
    key: 'print', 
    label: 'พิมพ์', 
    separator: true,
    icon: Printer
  },
  { 
    key: 'export', 
    label: 'ส่งออก Excel',
    icon: FileSpreadsheet
  }
] 

// Interface สำหรับ custom action ของประชาชน
export interface CitizenCustomAction {
  key: string
  label: string
  icon?: Component  // ใช้ Component type จาก Vue แทน
  separator?: boolean
  variant?: 'default' | 'destructive' | 'ghost'
  className?: string
  disabled?: boolean
  visible?: boolean
}

// ส่วนอื่นๆ เหมือนเดิม
export const CITIZEN_DISPLAY_FIELDS = {
  ID_FIELD: 'citizen_id',
  DATE_FIELD: 'birth_date',
  REMARK_FIELD: 'remark'
} as const

export const CITIZEN_COLUMN_CLASSES = {
  ID: 'w-16',
  CITIZEN_ID: 'font-mono break-all min-w-48',
  DATE: 'min-w-32',
  REMARK: 'max-w-48 truncate', // ใช้ truncate เพื่อตัดข้อความยาว
  CREATED_AT: 'text-gray-600 min-w-40'
} as const

export const CITIZEN_SEARCH_FIELDS = [
  'citizen_id',
  'remark', 
  'birth_date',
  'id'
] as const

export const CITIZEN_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

// Enum สำหรับสถานะประชาชน
export enum CitizenStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

// Type สำหรับ key ของ action
export type CitizenActionKey = typeof CITIZEN_CUSTOM_ACTIONS[number]['key']
