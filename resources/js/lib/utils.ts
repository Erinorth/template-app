// ไฟล์: resources/js/lib/utils.ts
// ไฟล์หลักที่ re-export functions จาก formatters และเก็บ utilities อื่นๆ

import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Updater } from '@tanstack/vue-table'
import type { Ref } from 'vue'

// ======= RE-EXPORT FORMATTERS =======
// Export formatters ทั้งหมดจากโฟลเดอร์ formatters
export * from './formatters'

// ======= UTILITY FUNCTIONS =======

/**
 * รวม class names โดยใช้ clsx และ tailwind-merge
 * @param inputs - class names ที่ต้องการรวม
 * @returns string - class names ที่รวมแล้ว
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * อัปเดตค่า ref จาก updater function หรือค่าโดยตรง
 * @param updaterOrValue - updater function หรือค่าที่ต้องการ set
 * @param ref - Vue ref ที่ต้องการอัปเดต
 */
export function valueUpdater<T extends Updater<any>>(
  updaterOrValue: T,
  ref: Ref
): void {
  ref.value =
    typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}

/**
 * คัดลอกข้อความไปยัง clipboard
 * @param text - ข้อความที่ต้องการคัดลอก
 * @returns Promise<void>
 */
export async function copyToClipboard(text: string): Promise<void> {
  // ใช้ Clipboard API ถ้ามี
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }

  // Fallback สำหรับ browser เก่า
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

/**
 * ลบ duplicate items จาก array โดยใช้ key
 * @param array - array ที่ต้องการลบ duplicate
 * @param key - key ที่ใช้ในการเปรียบเทียบ
 * @returns T[] - array ที่ไม่มี duplicate
 * 
 * @example
 * uniqueBy([{id: 1}, {id: 2}, {id: 1}], 'id') // [{id: 1}, {id: 2}]
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()

  return array.filter(item => {
    const value = item[key]

    if (seen.has(value)) {
      return false
    }

    seen.add(value)
    return true
  })
}

/**
 * Deep clone object
 * @param obj - object ที่ต้องการ clone
 * @returns T - cloned object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T
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
 * Safe localStorage operations
 */
export function safeStorageGet(key: string, defaultValue: any = null): any {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function safeStorageSet(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/**
 * Debounce function
 * @param fn - function ที่ต้องการ debounce
 * @param delay - เวลา delay (milliseconds)
 * @returns debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * Throttle function
 * @param fn - function ที่ต้องการ throttle
 * @param limit - เวลาขั้นต่ำระหว่างการเรียก (milliseconds)
 * @returns throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
