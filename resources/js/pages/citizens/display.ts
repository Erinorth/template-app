// ไฟล์: resources/js/pages/citizens/display.ts
// จัดการการตั้งค่าการแสดงผล fields และ CSS classes

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
