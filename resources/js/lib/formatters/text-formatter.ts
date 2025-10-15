/**
 * ไฟล์: resources/js/lib/formatters/text-formatter.ts
 * คำอธิบาย: Text formatting utilities
 * หน้าที่: จัดการการจัดรูปแบบข้อความต่างๆ
 */

/**
 * ตัดข้อความและเพิ่ม ellipsis
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * แปลงข้อความเป็น Title Case
 */
export function toTitleCase(text: string): string {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * แปลงข้อความเป็น Sentence Case
 */
export function toSentenceCase(text: string): string {
  if (!text) return ''
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * ลบช่องว่างที่ไม่จำเป็น
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return ''
  
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * แปลง camelCase หรือ snake_case เป็นข้อความที่อ่านได้
 */
export function humanizeString(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/([A-Z])/g, ' $1') // camelCase
    .replace(/[._-]/g, ' ') // snake_case และ kebab-case
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * สร้าง slug จากข้อความ
 */
export function slugify(text: string): string {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Highlight คำที่ค้นหา
 */
export function highlightText(
  text: string,
  query: string,
  className: string = 'bg-yellow-200'
): string {
  if (!text || !query) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, `<mark class="${className}">$1</mark>`)
}

/**
 * แปลงข้อความเป็นตัวพิมพ์เล็กและลบอักขระพิเศษ
 */
export function sanitizeString(text: string): string {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * นับจำนวนคำในข้อความ
 */
export function wordCount(text: string): number {
  if (!text) return 0
  
  return text.trim().split(/\s+/).length
}

/**
 * นับจำนวนตัวอักษรในข้อความ (ไม่รวมช่องว่าง)
 */
export function characterCount(text: string, includeSpaces: boolean = false): number {
  if (!text) return 0
  
  return includeSpaces ? text.length : text.replace(/\s/g, '').length
}
