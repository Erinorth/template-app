// ไฟล์: resources/js/pages/citizens/status.ts
// จัดการ status และ state ที่เกี่ยวข้อง

/**
 * Enum สำหรับ Citizen Status
 */
export enum CitizenStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * Status labels สำหรับแสดงผล
 */
export const CITIZEN_STATUS_LABELS: Record<CitizenStatus, string> = {
  [CitizenStatus.ACTIVE]: 'ใช้งานอยู่',
  [CitizenStatus.INACTIVE]: 'ไม่ใช้งาน',
  [CitizenStatus.PENDING]: 'รอดำเนินการ'
} as const

/**
 * Status colors สำหรับ badge
 */
export const CITIZEN_STATUS_COLORS: Record<CitizenStatus, string> = {
  [CitizenStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [CitizenStatus.INACTIVE]: 'bg-gray-100 text-gray-800',
  [CitizenStatus.PENDING]: 'bg-yellow-100 text-yellow-800'
} as const
