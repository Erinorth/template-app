/**
 * ไฟล์: resources/js/lib/utils.ts
 * คำอธิบาย: Utility functions รวมสำหรับใช้ทั้งโปรเจค
 */

import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Updater } from "@tanstack/vue-table";
import type { Ref } from "vue";

// Export formatters ทั้งหมด
export * from "./formatters";

// Export formatDateTime โดยเฉพาะเพื่อป้องกัน TypeScript error
export { formatDateTime } from "./formatters/date-formatter";

/**
 * ฟังก์ชันรวม class names โดยใช้ clsx และ tailwind-merge
 * @param inputs - class names ที่ต้องการรวม
 * @returns class names ที่รวมและ merge แล้ว
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * ฟังก์ชันสำหรับอัปเดต ref value จาก Updater
 * @param updaterOrValue - ค่าหรือฟังก์ชัน updater
 * @param ref - ref ที่ต้องการอัปเดต
 */
export function valueUpdater<T extends Updater<any>>(
  updaterOrValue: T,
  ref: Ref
): void {
  ref.value =
    typeof updaterOrValue === "function"
      ? updaterOrValue(ref.value)
      : updaterOrValue;
}

/**
 * ฟังก์ชันคัดลอกข้อความไปยัง clipboard
 * @param text - ข้อความที่ต้องการคัดลอก
 * @returns Promise ที่ resolve เมื่อคัดลอกสำเร็จ
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback สำหรับ browser ที่ไม่รองรับ Clipboard API
  return new Promise((resolve, reject) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      resolve();
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

/**
 * ฟังก์ชันกรองข้อมูลที่ซ้ำกันโดยใช้ key
 * @param array - array ที่ต้องการกรอง
 * @param key - key ที่ใช้ในการเปรียบเทียบ
 * @returns array ที่ไม่มีข้อมูลซ้ำ
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * ฟังก์ชัน deep clone object
 * @param obj - object ที่ต้องการ clone
 * @returns object ที่ clone แล้ว
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array)
    return obj.map((item) => deepClone(item)) as unknown as T;
  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * ฟังก์ชันอ่านข้อมูลจาก localStorage อย่างปลอดภัย
 * @param key - key ที่ต้องการอ่าน
 * @param defaultValue - ค่า default ถ้าอ่านไม่ได้
 * @returns ข้อมูลที่อ่านได้หรือค่า default
 */
export function safeStorageGet(key: string, defaultValue: any = null): any {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * ฟังก์ชันเขียนข้อมูลไปยัง localStorage อย่างปลอดภัย
 * @param key - key ที่ต้องการเขียน
 * @param value - ค่าที่ต้องการเขียน
 * @returns true ถ้าเขียนสำเร็จ, false ถ้าล้มเหลว
 */
export function safeStorageSet(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * ฟังก์ชัน debounce สำหรับหน่วงเวลาการเรียกฟังก์ชัน
 * @param fn - ฟังก์ชันที่ต้องการ debounce
 * @param delay - ระยะเวลาที่ต้องการหน่วง (มิลลิวินาที)
 * @returns ฟังก์ชันที่ debounce แล้ว
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (this: any, ...args: Parameters<T>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * ฟังก์ชัน throttle สำหรับจำกัดจำนวนครั้งการเรียกฟังก์ชัน
 * @param fn - ฟังก์ชันที่ต้องการ throttle
 * @param limit - ระยะเวลาขั้นต่ำระหว่างการเรียก (มิลลิวินาที)
 * @returns ฟังก์ชันที่ throttle แล้ว
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
