// ไฟล์: resources/js/pages/citizens/constants.ts
import { 
  CreditCard, 
  History, 
  Printer, 
  FileSpreadsheet
} from 'lucide-vue-next'
import type { CustomAction } from '@/composables/useColumnBuilder'

/**
 * Custom actions สำหรับ Citizen
 * ใช้ CustomAction type จาก useColumnBuilder
 */
export const CITIZEN_CUSTOM_ACTIONS: CustomAction[] = [
  { 
    key: 'generateCard', 
    label: 'สร้างบัตร', 
    separator: true,
    icon: CreditCard,
    variant: 'default'
  },
  { 
    key: 'viewHistory', 
    label: 'ดูประวัติ',
    icon: History,
    variant: 'ghost'
  },
  { 
    key: 'print', 
    label: 'พิมพ์', 
    separator: true,
    icon: Printer,
    variant: 'default'
  },
  { 
    key: 'export', 
    label: 'ส่งออก Excel',
    icon: FileSpreadsheet,
    variant: 'default'
  }
] as const

/**
 * Display fields mapping
 */
export const CITIZEN_DISPLAY_FIELDS = {
  ID_FIELD: 'citizen_id',
  DATE_FIELD: 'birth_date',
  REMARK_FIELD: 'remark'
} as const

/**
 * Column CSS classes
 */
export const CITIZEN_COLUMN_CLASSES = {
  ID: 'w-16',
  CITIZEN_ID: 'font-mono break-all min-w-48',
  DATE: 'min-w-32',
  REMARK: 'max-w-48 truncate',
  CREATED_AT: 'text-gray-600 min-w-40'
} as const

/**
 * Searchable fields
 */
export const CITIZEN_SEARCH_FIELDS = [
  'citizen_id',
  'remark', 
  'birth_date',
  'id'
] as const

/**
 * Page size options
 */
export const CITIZEN_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

/**
 * Citizen status enum
 */
export enum CitizenStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * Type สำหรับ action keys
 */
export type CitizenActionKey = typeof CITIZEN_CUSTOM_ACTIONS[number]['key']
