// ไฟล์: resources/js/pages/citizens/actions.ts
// จัดการ UI Configuration สำหรับ Citizen Actions เท่านั้น

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
 * Type helper สำหรับ action keys
 */
export type CitizenActionKey = typeof CITIZEN_ACTIONS_UI_CONFIG[number]['key']
