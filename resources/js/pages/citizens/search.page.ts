// ไฟล์: resources/js/pages/citizens/search.page.ts
// จัดการการตั้งค่าการค้นหาและ pagination

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
 * ค่าเริ่มต้นของ page size
 */
export const DEFAULT_PAGE_SIZE = 10 as const
