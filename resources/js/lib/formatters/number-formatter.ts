// ไฟล์: resources/js/lib/formatters/number-formatter.ts
// จัดการเฉพาะเรื่อง Number และ Currency formatting

/**
 * จัดรูปแบบตัวเลขตาม locale
 * @param num - ตัวเลขที่ต้องการจัดรูปแบบ
 * @param locale - Locale สำหรับแสดงผล (default: 'th-TH')
 * @param options - Options เพิ่มเติมสำหรับ Intl.NumberFormat
 * @returns string - ตัวเลขที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatNumber(1234567.89) // "1,234,567.89"
 * formatNumber(1234567.89, 'en-US') // "1,234,567.89"
 */
export function formatNumber(
  num: number,
  locale: string = 'th-TH',
  options?: Intl.NumberFormatOptions
): string {
  // ตรวจสอบว่าเป็นตัวเลขที่ valid หรือไม่
  if (typeof num !== 'number' || isNaN(num)) {
    console.warn('Invalid number provided to formatNumber:', num)
    return '-'
  }

  return new Intl.NumberFormat(locale, options).format(num)
}

/**
 * จัดรูปแบบเงินตาม currency และ locale
 * @param amount - จำนวนเงิน
 * @param currency - สกุลเงิน (default: 'THB')
 * @param locale - Locale สำหรับแสดงผล (default: 'th-TH')
 * @returns string - เงินที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatCurrency(1234567.89) // "฿1,234,567.89"
 * formatCurrency(1234567.89, 'USD', 'en-US') // "$1,234,567.89"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'THB',
  locale: string = 'th-TH'
): string {
  // ตรวจสอบว่าเป็นตัวเลขที่ valid หรือไม่
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
 * @param value - ค่าที่ต้องการแสดงเป็นเปอร์เซ็นต์ (0-1 หรือ 0-100)
 * @param locale - Locale สำหรับแสดงผล (default: 'th-TH')
 * @param isDecimal - ถ้าเป็น true จะถือว่าค่า input อยู่ในรูป 0-1 (default: false)
 * @returns string - เปอร์เซ็นต์ที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatPercent(75) // "75%"
 * formatPercent(0.75, 'th-TH', true) // "75%"
 */
export function formatPercent(
  value: number,
  locale: string = 'th-TH',
  isDecimal: boolean = false
): string {
  // ตรวจสอบว่าเป็นตัวเลขที่ valid หรือไม่
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
 * จัดรูปแบบตัวเลขเป็นหน่วย compact (K, M, B)
 * @param num - ตัวเลขที่ต้องการจัดรูปแบบ
 * @param locale - Locale สำหรับแสดงผล (default: 'th-TH')
 * @returns string - ตัวเลขแบบ compact
 * 
 * @example
 * formatCompactNumber(1234) // "1.2K"
 * formatCompactNumber(1234567) // "1.2M"
 * formatCompactNumber(1234567890) // "1.2B"
 */
export function formatCompactNumber(
  num: number,
  locale: string = 'th-TH'
): string {
  // ตรวจสอบว่าเป็นตัวเลขที่ valid หรือไม่
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
 * จัดรูปแบบตัวเลขเป็น ordinal (1st, 2nd, 3rd)
 * @param num - ตัวเลขที่ต้องการจัดรูปแบบ
 * @param locale - Locale สำหรับแสดงผล (default: 'en-US')
 * @returns string - ตัวเลข ordinal
 * 
 * @example
 * formatOrdinal(1) // "1st"
 * formatOrdinal(2) // "2nd"
 * formatOrdinal(3) // "3rd"
 * formatOrdinal(21) // "21st"
 */
export function formatOrdinal(
  num: number,
  locale: string = 'en-US'
): string {
  // ตรวจสอบว่าเป็นตัวเลขที่ valid หรือไม่
  if (typeof num !== 'number' || isNaN(num) || !Number.isInteger(num)) {
    console.warn('Invalid number provided to formatOrdinal:', num)
    return '-'
  }

  // สำหรับภาษาไทย ใช้รูปแบบ "ที่ 1", "ที่ 2"
  if (locale === 'th-TH') {
    return `ที่ ${num}`
  }

  // สำหรับภาษาอังกฤษ
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
 * จัดรูปแบบขนาดไฟล์เป็น human-readable
 * @param bytes - ขนาดไฟล์เป็น bytes
 * @param decimals - จำนวนทศนิยม (default: 2)
 * @returns string - ขนาดไฟล์ที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatFileSize(1024) // "1.00 KB"
 * formatFileSize(1048576) // "1.00 MB"
 * formatFileSize(1073741824) // "1.00 GB"
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  // ตรวจสอบว่าเป็นตัวเลขที่ valid หรือไม่
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    console.warn('Invalid bytes provided to formatFileSize:', bytes)
    return '-'
  }

  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * ปัดเศษตัวเลขตามจำนวนทศนิยมที่กำหนด
 * @param num - ตัวเลขที่ต้องการปัดเศษ
 * @param decimals - จำนวนทศนิยม (default: 2)
 * @returns number - ตัวเลขที่ปัดเศษแล้ว
 * 
 * @example
 * roundNumber(1.2345, 2) // 1.23
 * roundNumber(1.2365, 2) // 1.24
 */
export function roundNumber(num: number, decimals: number = 2): number {
  // ตรวจสอบว่าเป็นตัวเลขที่ valid หรือไม่
  if (typeof num !== 'number' || isNaN(num)) {
    console.warn('Invalid number provided to roundNumber:', num)
    return 0
  }

  const multiplier = Math.pow(10, decimals)
  return Math.round(num * multiplier) / multiplier
}

/**
 * แปลงตัวเลขเป็นคำอ่าน (สำหรับภาษาไทย)
 * @param num - ตัวเลขที่ต้องการแปลง (0-9,999,999)
 * @returns string - คำอ่านของตัวเลข
 * 
 * @example
 * numberToThaiText(123) // "หนึ่งร้อยยี่สิบสาม"
 * numberToThaiText(1000) // "หนึ่งพัน"
 */
export function numberToThaiText(num: number): string {
  // ตรวจสอบว่าเป็นตัวเลขที่ valid หรือไม่
  if (typeof num !== 'number' || isNaN(num) || !Number.isInteger(num) || num < 0) {
    console.warn('Invalid number provided to numberToThaiText:', num)
    return ''
  }

  if (num === 0) return 'ศูนย์'
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

  return result
}
