// ไฟล์: resources/js/pages/citizens/constants.ts
// ประกาศ constants และ UI config สำหรับหน้า Citizens

import { 
  CreditCard, 
  History, 
  Printer, 
  FileSpreadsheet
} from 'lucide-vue-next'
import type { Component } from 'vue'

/**
 * Interface สำหรับ UI Config ของ Custom Action
 * ไม่รวม handler เพราะจะถูกเพิ่มทีหลังใน use.ts
 */
export interface CitizenActionUIConfig {
  key: string
  label: string
  icon?: Component
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  separator?: boolean
  className?: string
  visible?: boolean
  disabled?: boolean
}

/**
 * กำหนด UI Config สำหรับ Citizen Actions
 * Handler จะถูกเพิ่มใน use.ts
 */
export const CITIZEN_ACTIONS_UI_CONFIG: CitizenActionUIConfig[] = [
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
 * กำหนด field names ที่ใช้แสดงผล
 */
export const CITIZEN_DISPLAY_FIELDS = {
  ID_FIELD: 'citizen_id',
  DATE_FIELD: 'birth_date',
  REMARK_FIELD: 'remark'
} as const

/**
 * กำหนด CSS classes สำหรับแต่ละ column
 */
export const CITIZEN_COLUMN_CLASSES = {
  ID: 'w-16',
  CITIZEN_ID: 'font-mono break-all min-w-48',
  DATE: 'min-w-32',
  REMARK: 'max-w-48 truncate',
  CREATED_AT: 'text-gray-600 min-w-40'
} as const

/**
 * กำหนด fields ที่ใช้ในการค้นหา
 */
export const CITIZEN_SEARCH_FIELDS = [
  'citizen_id',
  'remark', 
  'birth_date',
  'id'
] as const

/**
 * ตัวเลือกจำนวนแถวต่อหน้า
 */
export const CITIZEN_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

/**
 * Enum สำหรับ Citizen Status
 */
export enum CitizenStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * Type helper สำหรับ action keys
 */
export type CitizenActionKey = typeof CITIZEN_ACTIONS_UI_CONFIG[number]['key']
