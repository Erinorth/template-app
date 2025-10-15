/**
 * ไฟล์: resources/js/lib/formatters/number-formatter.ts
 * คำอธิบาย: Number formatting utilities
 * หน้าที่: จัดรูปแบบตัวเลขและสกุลเงิน
 */

/**
 * Options สำหรับ number formatting
 */
export interface NumberFormatOptions {
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  useGrouping?: boolean
}

/**
 * จัดรูปแบบตัวเลขทั่วไป
 * @param num - ตัวเลขที่ต้องการจัดรูปแบบ
 * @param locale - locale สำหรับการจัดรูปแบบ (default: 'th-TH')
 * @param options - options เพิ่มเติมสำหรับการจัดรูปแบบ
 * @returns ตัวเลขที่จัดรูปแบบแล้ว
 */
export function formatNumber(
  num: number,
  locale: string = 'th-TH',
  options?: NumberFormatOptions
): string {
  if (typeof num !== 'number' || isNaN(num)) {
    console.warn('Invalid number provided to formatNumber:', num)
    return '-'
  }

  return new Intl.NumberFormat(locale, options).format(num)
}

/**
 * จัดรูปแบบสกุลเงิน
 * @param amount - จำนวนเงินที่ต้องการจัดรูปแบบ
 * @param currency - สกุลเงิน (default: 'THB')
 * @param locale - locale สำหรับการจัดรูปแบบ (default: 'th-TH')
 * @returns สกุลเงินที่จัดรูปแบบแล้ว
 */
export function formatCurrency(
  amount: number,
  currency: string = 'THB',
  locale: string = 'th-TH'
): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.warn('Invalid amount provided to formatCurrency:', amount)
    return '-'
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * จัดรูปแบบเปอร์เซ็นต์
 * @param value - ค่าที่ต้องการแปลงเป็นเปอร์เซ็นต์
 * @param locale - locale สำหรับการจัดรูปแบบ (default: 'th-TH')
 * @param isDecimal - ค่าเป็น decimal หรือไม่ (default: false)
 * @returns เปอร์เซ็นต์ที่จัดรูปแบบแล้ว
 */
export function formatPercent(
  value: number,
  locale: string = 'th-TH',
  isDecimal: boolean = false
): string {
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn('Invalid value provided to formatPercent:', value)
    return '-'
  }

  const percentValue = isDecimal ? value : value / 100

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(percentValue)
}

/**
 * จัดรูปแบบตัวเลขแบบย่อ (1K, 1M, 1B)
 * @param num - ตัวเลขที่ต้องการจัดรูปแบบ
 * @param locale - locale สำหรับการจัดรูปแบบ (default: 'th-TH')
 * @returns ตัวเลขแบบย่อที่จัดรูปแบบแล้ว
 */
export function formatCompactNumber(
  num: number,
  locale: string = 'th-TH'
): string {
  if (typeof num !== 'number' || isNaN(num)) {
    console.warn('Invalid number provided to formatCompactNumber:', num)
    return '-'
  }

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num)
}

/**
 * จัดรูปแบบตัวเลขขนาดไฟล์ (Bytes, KB, MB, GB)
 * @param bytes - จำนวน bytes
 * @param decimals - จำนวนทศนิยม (default: 2)
 * @returns ขนาดไฟล์ที่จัดรูปแบบแล้ว
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  if (!bytes || bytes < 0) return '-'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Round ตัวเลข
 * @param num - ตัวเลขที่ต้องการ round
 * @param decimals - จำนวนทศนิยม (default: 2)
 * @returns ตัวเลขที่ round แล้ว
 */
export function roundNumber(num: number, decimals: number = 2): number {
  if (typeof num !== 'number' || isNaN(num)) {
    console.warn('Invalid number provided to roundNumber:', num)
    return 0
  }

  const multiplier = Math.pow(10, decimals)
  return Math.round(num * multiplier) / multiplier
}

/**
 * จัดรูปแบบลำดับ (1st, 2nd, 3rd, 4th)
 * @param num - ตัวเลขลำดับ
 * @param locale - locale สำหรับการจัดรูปแบบ (default: 'en-US')
 * @returns ลำดับที่จัดรูปแบบแล้ว
 */
export function formatOrdinal(num: number, locale: string = 'en-US'): string {
  if (typeof num !== 'number' || isNaN(num) || !Number.isInteger(num)) {
    console.warn('Invalid number provided to formatOrdinal:', num)
    return '-'
  }

  // สำหรับภาษาไทยใช้ "ที่" นำหน้าเลข
  if (locale === 'th-TH') {
    return `ที่ ${num}`
  }

  const pluralRules = new Intl.PluralRules(locale, { type: 'ordinal' })
  const rule = pluralRules.select(num)

  const suffixes: Record<string, string> = {
    one: 'st',
    two: 'nd',
    few: 'rd',
    other: 'th',
  }

  return `${num}${suffixes[rule] || 'th'}`
}

/**
 * แปลงตัวเลขเป็นคำภาษาไทย (สำหรับจำนวนเงิน)
 * @param num - ตัวเลขที่ต้องการแปลง
 * @returns ข้อความภาษาไทย
 */
export function numberToThaiText(num: number): string {
  if (typeof num !== 'number' || isNaN(num) || !Number.isInteger(num) || num < 0) {
    console.warn('Invalid number provided to numberToThaiText:', num)
    return ''
  }

  if (num === 0) return 'ศูนย์บาทถ้วน'
  if (num > 9999999) {
    console.warn('Number too large for numberToThaiText:', num)
    return num.toString()
  }

  const digit = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const position = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']

  const numStr = num.toString()
  const len = numStr.length
  let result = ''

  for (let i = 0; i < len; i++) {
    const d = parseInt(numStr[i])
    const p = len - i - 1

    if (d === 0) continue

    // กรณีพิเศษ
    if (p === 1 && d === 1) {
      result += 'สิบ'
    } else if (p === 1 && d === 2) {
      result += 'ยี่สิบ'
    } else if (p === 0 && d === 1 && len > 1) {
      result += 'เอ็ด'
    } else {
      result += digit[d] + position[p]
    }
  }

  return result + 'บาท'
}
