// ไฟล์: resources/js/lib/formatters/thai-id-formatter.ts
// จัดการเฉพาะเรื่อง Thai Citizen ID

/**
 * ตรวจสอบความถูกต้องของเลขบัตรประชาชนไทย
 */
export function isValidThaiCitizenId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i)
  }
  const remainder = sum % 11
  const checkDigit = remainder < 2 ? remainder : 11 - remainder

  return checkDigit === parseInt(id[12])
}

/**
 * จัดรูปแบบเลขบัตรประชาชนไทย
 */
export function formatThaiCitizenId(value: string): string {
  const cleaned = value.replace(/\D/g, '').substring(0, 13)

  if (cleaned.length <= 1) return cleaned
  if (cleaned.length <= 5) return `${cleaned.substring(0, 1)}-${cleaned.substring(1)}`
  if (cleaned.length <= 10) return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 5)}-${cleaned.substring(5)}`
  if (cleaned.length <= 12) return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 5)}-${cleaned.substring(5, 10)}-${cleaned.substring(10)}`

  return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 5)}-${cleaned.substring(5, 10)}-${cleaned.substring(10, 12)}-${cleaned.substring(12)}`
}

/**
 * ลบอักขระที่ไม่ใช่ตัวเลขออก
 */
export function cleanThaiCitizenId(value: string): string {
  return value.replace(/\D/g, '')
}
