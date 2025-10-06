// สถานที่จัดเก็บ: resources/js/lib/utils.ts
import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(
  updaterOrValue: T,
  ref: Ref,
): void {
  ref.value =
    typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}

/**
 * คัดลอกข้อความไปยัง clipboard
 * @param text - ข้อความที่ต้องการคัดลอก
 */
export function copyToClipboard(text: string): Promise<void> {
  // ตรวจสอบว่า Clipboard API พร้อมใช้งานหรือไม่
  if (!navigator.clipboard) {
    // ใช้วิธี fallback สำหรับ browser เก่า
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        resolve()
      } catch (err) {
        reject(err)
      } finally {
        document.body.removeChild(textArea)
      }
    })
  }

  return navigator.clipboard.writeText(text)
}

/**
 * จัดรูปแบบตัวเลขเป็นสกุลเงิน
 * @param amount - จำนวนเงิน
 * @param currency - สกุลเงิน (ค่าเริ่มต้น: THB)
 * @param locale - รูปแบบภาษา (ค่าเริ่มต้น: th-TH)
 */
export function formatCurrency(
  amount: number,
  currency = 'THB',
  locale = 'th-TH',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * จัดรูปแบบวันที่
 * @param date - วันที่
 * @param locale - รูปแบบภาษา (ค่าเริ่มต้น: th-TH)
 * @param options - ตัวเลือกการแสดงผล
 */
export function formatDate(
  date: string | Date,
  locale = 'th-TH',
  options?: Intl.DateTimeFormatOptions,
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options })
}

/**
 * จัดรูปแบบวันที่และเวลา
 * @param date - วันที่และเวลา
 * @param locale - รูปแบบภาษา (ค่าเริ่มต้น: th-TH)
 * @param options - ตัวเลือกการแสดงผล
 */
export function formatDateTime(
  date: string | Date,
  locale = 'th-TH',
  options?: Intl.DateTimeFormatOptions,
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(locale, { ...defaultOptions, ...options })
}

/**
 * จัดรูปแบบตัวเลข
 * @param num - ตัวเลข
 * @param locale - รูปแบบภาษา (ค่าเริ่มต้น: th-TH)
 * @param options - ตัวเลือกการแสดงผล
 */
export function formatNumber(
  num: number,
  locale = 'th-TH',
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(num)
}

/**
 * ตัดข้อความให้สั้นลง
 * @param text - ข้อความ
 * @param maxLength - ความยาวสูงสุด (ค่าเริ่มต้น: 50)
 */
export function truncateText(text: string, maxLength = 50): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * แปลงตัวอักษรตัวแรกเป็นตัวพิมพ์ใหญ่
 * @param str - ข้อความ
 */
export function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * กรองข้อมูลซ้ำโดยใช้ key
 * @param array - อาร์เรย์ข้อมูล
 * @param key - คีย์ที่ใช้เปรียบเทียบ
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter((item) => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

/**
 * คัดลอกข้อมูลแบบ deep clone
 * @param obj - ออบเจ็กต์ที่ต้องการคัดลอก
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj

  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * ตรวจสอบรูปแบบอีเมล
 * @param email - อีเมลที่ต้องการตรวจสอบ
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * ตรวจสอบเลขประจำตัวประชาชนไทยว่าถูกต้องหรือไม่
 * @param id - เลขประจำตัวประชาชน 13 หลัก
 * @returns true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
 */
export function isValidThaiCitizenId(id: string): boolean {
  // ตรวจสอบว่าเป็นตัวเลข 13 หลัก
  if (!/^\d{13}$/.test(id)) return false

  // คำนวณ checksum ด้วย algorithm ของบัตรประชาชนไทย
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i)
  }
  const remainder = sum % 11
  const checkDigit = remainder < 2 ? remainder : 11 - remainder

  return checkDigit === parseInt(id[12])
}

/**
 * จัดรูปแบบเลขประจำตัวประชาชนไทยให้เป็น X-XXXX-XXXXX-XX-X
 * @param value - เลขประจำตัวประชาชน (อาจมีหรือไม่มีขีดก็ได้)
 * @returns เลขประจำตัวประชาชนที่จัดรูปแบบแล้ว
 */
export function formatThaiCitizenId(value: string): string {
  // ลบตัวอักษรที่ไม่ใช่ตัวเลขออกและจำกัดความยาวไม่เกิน 13 หลัก
  const cleaned = value.replace(/\D/g, '').substring(0, 13)

  // จัดรูปแบบตามความยาว
  if (cleaned.length <= 1) return cleaned
  if (cleaned.length <= 5)
    return `${cleaned.substring(0, 1)}-${cleaned.substring(1)}`
  if (cleaned.length <= 10)
    return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 5)}-${cleaned.substring(5)}`
  if (cleaned.length <= 12)
    return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 5)}-${cleaned.substring(5, 10)}-${cleaned.substring(10)}`

  return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 5)}-${cleaned.substring(5, 10)}-${cleaned.substring(10, 12)}-${cleaned.substring(12)}`
}

/**
 * ดึงข้อมูลจาก localStorage อย่างปลอดภัย
 * @param key - คีย์ใน localStorage
 * @param defaultValue - ค่าเริ่มต้นถ้าไม่พบข้อมูล
 */
export function safeStorageGet(key: string, defaultValue: any = null): any {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * บันทึกข้อมูลลง localStorage อย่างปลอดภัย
 * @param key - คีย์ใน localStorage
 * @param value - ค่าที่ต้องการบันทึก
 */
export function safeStorageSet(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
