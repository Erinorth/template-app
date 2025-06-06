import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Updater } from '@tanstack/vue-table'
import { type Ref } from 'vue'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// เพิ่มฟังก์ชัน valueUpdater
export function valueUpdater<T extends Updater<any>>(
  updaterOrValue: T,
  ref: Ref
) {
  ref.value =
    typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue
}

// ฟังก์ชันสำหรับ copy ข้อความ
export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

// ฟังก์ชันสำหรับ format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
  }).format(amount)
}
