// ไฟล์: resources/js/lib/formatters/date-formatter.ts
// จัดการเฉพาะเรื่อง Date และ DateTime formatting

/**
 * จัดรูปแบบวันที่เป็นภาษาไทย
 * @param date - วันที่ (string หรือ Date object)
 * @param locale - Locale สำหรับแสดงผล (default: 'th-TH')
 * @param options - Options เพิ่มเติมสำหรับ Intl.DateTimeFormat
 * @returns string - วันที่ที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatDate('2025-10-15') // "15 ต.ค. 2025"
 * formatDate('2025-10-15', 'en-US') // "Oct 15, 2025"
 */
export function formatDate(
  date: string | Date,
  locale: string = 'th-TH',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  // ตรวจสอบว่าเป็น Invalid Date หรือไม่
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date)
    return '-'
  }

  return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options })
}

/**
 * จัดรูปแบบวันที่และเวลาเป็นภาษาไทย
 * @param date - วันที่และเวลา (string หรือ Date object)
 * @param locale - Locale สำหรับแสดงผล (default: 'th-TH')
 * @param options - Options เพิ่มเติมสำหรับ Intl.DateTimeFormat
 * @returns string - วันที่และเวลาที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatDateTime('2025-10-15T11:44:00') // "15 ต.ค. 2025, 11:44"
 */
export function formatDateTime(
  date: string | Date,
  locale: string = 'th-TH',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  // ตรวจสอบว่าเป็น Invalid Date หรือไม่
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateTime:', date)
    return '-'
  }

  return dateObj.toLocaleString(locale, { ...defaultOptions, ...options })
}

/**
 * จัดรูปแบบเวลาเท่านั้น (ไม่รวมวันที่)
 * @param date - วันที่และเวลา (string หรือ Date object)
 * @param locale - Locale สำหรับแสดงผล (default: 'th-TH')
 * @returns string - เวลาที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatTime('2025-10-15T11:44:00') // "11:44"
 */
export function formatTime(
  date: string | Date,
  locale: string = 'th-TH'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // ตรวจสอบว่าเป็น Invalid Date หรือไม่
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatTime:', date)
    return '-'
  }

  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * จัดรูปแบบวันที่แบบเต็ม (รวมวันในสัปดาห์)
 * @param date - วันที่ (string หรือ Date object)
 * @param locale - Locale สำหรับแสดงผล (default: 'th-TH')
 * @returns string - วันที่แบบเต็มที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatDateFull('2025-10-15') // "วันพุธที่ 15 ตุลาคม 2025"
 */
export function formatDateFull(
  date: string | Date,
  locale: string = 'th-TH'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // ตรวจสอบว่าเป็น Invalid Date หรือไม่
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateFull:', date)
    return '-'
  }

  return dateObj.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * คำนวณอายุจากวันเกิด
 * @param birthDate - วันเกิด (string หรือ Date object)
 * @returns number - อายุเป็นปี หรือ null ถ้าข้อมูลไม่ถูกต้อง
 * 
 * @example
 * calculateAge('1990-01-01') // 35
 */
export function calculateAge(birthDate: string | Date): number | null {
  const birthDateObj = typeof birthDate === 'string' ? new Date(birthDate) : birthDate

  // ตรวจสอบว่าเป็น Invalid Date หรือไม่
  if (isNaN(birthDateObj.getTime())) {
    console.warn('Invalid birth date provided to calculateAge:', birthDate)
    return null
  }

  const today = new Date()
  let age = today.getFullYear() - birthDateObj.getFullYear()
  const monthDiff = today.getMonth() - birthDateObj.getMonth()

  // ปรับอายุถ้ายังไม่ถึงวันเกิดในปีนี้
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--
  }

  return age
}

/**
 * แปลงวันที่เป็น Relative time (เช่น "2 วันที่แล้ว")
 * @param date - วันที่ (string หรือ Date object)
 * @param locale - Locale สำหรับแสดงผล (default: 'th-TH')
 * @returns string - Relative time
 * 
 * @example
 * formatRelativeTime('2025-10-13T11:44:00') // "2 วันที่แล้ว"
 */
export function formatRelativeTime(
  date: string | Date,
  locale: string = 'th-TH'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // ตรวจสอบว่าเป็น Invalid Date หรือไม่
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatRelativeTime:', date)
    return '-'
  }

  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffYear > 0) return rtf.format(-diffYear, 'year')
  if (diffMonth > 0) return rtf.format(-diffMonth, 'month')
  if (diffWeek > 0) return rtf.format(-diffWeek, 'week')
  if (diffDay > 0) return rtf.format(-diffDay, 'day')
  if (diffHour > 0) return rtf.format(-diffHour, 'hour')
  if (diffMin > 0) return rtf.format(-diffMin, 'minute')
  return rtf.format(-diffSec, 'second')
}

/**
 * ตรวจสอบว่าวันที่อยู่ในอดีตหรือไม่
 * @param date - วันที่ (string หรือ Date object)
 * @returns boolean - true ถ้าอยู่ในอดีต, false ถ้าเป็นปัจจุบันหรืออนาคต
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return false
  }

  return dateObj.getTime() < new Date().getTime()
}

/**
 * ตรวจสอบว่าวันที่อยู่ในอนาคตหรือไม่
 * @param date - วันที่ (string หรือ Date object)
 * @returns boolean - true ถ้าอยู่ในอนาคต, false ถ้าเป็นปัจจุบันหรืออดีต
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return false
  }

  return dateObj.getTime() > new Date().getTime()
}
