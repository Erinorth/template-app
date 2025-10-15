// ไฟล์: resources/js/lib/formatters/validation-formatter.ts
// จัดการเฉพาะเรื่อง Validation และ Data Validation

/**
 * ตรวจสอบว่า email ถูกต้องหรือไม่
 * @param email - email address ที่ต้องการตรวจสอบ
 * @returns boolean - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
 * 
 * @example
 * isValidEmail('test@example.com') // true
 * isValidEmail('invalid-email') // false
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * ตรวจสอบว่าเบอร์โทรศัพท์ไทยถูกต้องหรือไม่
 * @param phone - เบอร์โทรศัพท์
 * @returns boolean - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
 * 
 * @example
 * isValidThaiPhone('0812345678') // true
 * isValidThaiPhone('02-123-4567') // true
 * isValidThaiPhone('081-234-5678') // true
 * isValidThaiPhone('12345') // false
 */
export function isValidThaiPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }

  // ลบอักขระที่ไม่ใช่ตัวเลข
  const cleaned = phone.replace(/\D/g, '')

  // เบอร์มือถือ (08x, 09x, 06x) - 10 หลัก
  const mobileRegex = /^(06|08|09)\d{8}$/

  // เบอร์บ้าน (02, 03x-09x) - 9 หลัก
  const landlineRegex = /^(02|03[2-9]|04[2-5]|05[2-6]|07[3-7])\d{7}$/

  return mobileRegex.test(cleaned) || landlineRegex.test(cleaned)
}

/**
 * จัดรูปแบบเบอร์โทรศัพท์ไทย
 * @param phone - เบอร์โทรศัพท์
 * @returns string - เบอร์โทรที่จัดรูปแบบแล้ว
 * 
 * @example
 * formatThaiPhone('0812345678') // "081-234-5678"
 * formatThaiPhone('021234567') // "02-123-4567"
 */
export function formatThaiPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return ''
  }

  const cleaned = phone.replace(/\D/g, '')

  // เบอร์มือถือ 10 หลัก
  if (cleaned.length === 10 && /^(06|08|09)/.test(cleaned)) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
  }

  // เบอร์บ้าน 9 หลัก (02)
  if (cleaned.length === 9 && cleaned.startsWith('02')) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 5)}-${cleaned.substring(5)}`
  }

  // เบอร์บ้านต่างจังหวัด 9 หลัก
  if (cleaned.length === 9) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
  }

  return cleaned
}

/**
 * ตรวจสอบว่า URL ถูกต้องหรือไม่
 * @param url - URL ที่ต้องการตรวจสอบ
 * @returns boolean - true ถ้าถูกต้อง, false ถ้าไม่ถูกต้อง
 * 
 * @example
 * isValidUrl('https://www.example.com') // true
 * isValidUrl('http://example.com/path') // true
 * isValidUrl('not-a-url') // false
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * ตรวจสอบว่ารหัสผ่านมีความแข็งแรงเพียงพอหรือไม่
 * @param password - รหัสผ่าน
 * @param minLength - ความยาวขั้นต่ำ (default: 8)
 * @returns object - { isValid, score, suggestions }
 * 
 * @example
 * isStrongPassword('Pass123!') 
 * // { isValid: true, score: 4, suggestions: [] }
 */
export function isStrongPassword(
  password: string,
  minLength: number = 8
): {
  isValid: boolean
  score: number
  suggestions: string[]
} {
  const suggestions: string[] = []
  let score = 0

  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      suggestions: ['กรุณากรอกรหัสผ่าน'],
    }
  }

  // ตรวจสอบความยาว
  if (password.length < minLength) {
    suggestions.push(`รหัสผ่านต้องมีอย่างน้อย ${minLength} ตัวอักษร`)
  } else {
    score++
  }

  // ตรวจสอบตัวพิมพ์เล็ก
  if (/[a-z]/.test(password)) {
    score++
  } else {
    suggestions.push('ควรมีตัวอักษรพิมพ์เล็ก (a-z)')
  }

  // ตรวจสอบตัวพิมพ์ใหญ่
  if (/[A-Z]/.test(password)) {
    score++
  } else {
    suggestions.push('ควรมีตัวอักษรพิมพ์ใหญ่ (A-Z)')
  }

  // ตรวจสอบตัวเลข
  if (/\d/.test(password)) {
    score++
  } else {
    suggestions.push('ควรมีตัวเลข (0-9)')
  }

  // ตรวจสอบอักขระพิเศษ
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
  } else {
    suggestions.push('ควรมีอักขระพิเศษ (!@#$%^&* ฯลฯ)')
  }

  return {
    isValid: score >= 4 && password.length >= minLength,
    score,
    suggestions,
  }
}

/**
 * ตรวจสอบว่าค่าอยู่ในช่วงที่กำหนดหรือไม่
 * @param value - ค่าที่ต้องการตรวจสอบ
 * @param min - ค่าต่ำสุด
 * @param max - ค่าสูงสุด
 * @returns boolean - true ถ้าอยู่ในช่วง, false ถ้าไม่อยู่
 * 
 * @example
 * isInRange(5, 1, 10) // true
 * isInRange(15, 1, 10) // false
 */
export function isInRange(value: number, min: number, max: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false
  }

  return value >= min && value <= max
}

/**
 * ทำความสะอาด input (sanitize)
 * @param input - ข้อความที่ต้องการทำความสะอาด
 * @param allowHtml - อนุญาตให้มี HTML tags หรือไม่ (default: false)
 * @returns string - ข้อความที่สะอาดแล้ว
 * 
 * @example
 * sanitizeInput('<script>alert("xss")</script>Hello') // "Hello"
 * sanitizeInput('<p>Hello</p>', true) // "<p>Hello</p>"
 */
export function sanitizeInput(input: string, allowHtml: boolean = false): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input.trim()

  if (!allowHtml) {
    // ลบ HTML tags ทั้งหมด
    sanitized = sanitized.replace(/<[^>]*>/g, '')
  } else {
    // ลบเฉพาะ dangerous tags
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style']
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gi')
      sanitized = sanitized.replace(regex, '')
    })
  }

  // Escape อักขระพิเศษ
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  return sanitized
}
