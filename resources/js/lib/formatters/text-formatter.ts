// ไฟล์: resources/js/lib/formatters/text-formatter.ts
// จัดการเฉพาะเรื่อง Text formatting และ manipulation

/**
 * ตัดข้อความให้สั้นลงและเพิ่ม "..." ท้ายข้อความ
 * @param text - ข้อความที่ต้องการตัด
 * @param maxLength - ความยาวสูงสุด (default: 50)
 * @param suffix - ตัวอักษรที่จะเพิ่มท้าย (default: '...')
 * @returns string - ข้อความที่ตัดแล้ว
 * 
 * @example
 * truncateText('Hello World, this is a long text', 20) // "Hello World, this is..."
 */
export function truncateText(
  text: string,
  maxLength: number = 50,
  suffix: string = '...'
): string {
  if (!text || typeof text !== 'string') {
    return ''
  }

  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength) + suffix
}

/**
 * แปลงตัวอักษรตัวแรกให้เป็นตัวพิมพ์ใหญ่
 * @param str - ข้อความที่ต้องการแปลง
 * @returns string - ข้อความที่แปลงแล้ว
 * 
 * @example
 * capitalizeFirst('hello world') // "Hello world"
 */
export function capitalizeFirst(str: string): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * แปลงตัวอักษรทุกตัวให้เป็น Title Case
 * @param str - ข้อความที่ต้องการแปลง
 * @returns string - ข้อความที่แปลงแล้ว
 * 
 * @example
 * toTitleCase('hello world from thailand') // "Hello World From Thailand"
 */
export function toTitleCase(str: string): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * แปลง snake_case เป็น camelCase
 * @param str - ข้อความที่ต้องการแปลง
 * @returns string - ข้อความที่แปลงแล้ว
 * 
 * @example
 * snakeToCamel('hello_world_from_thailand') // "helloWorldFromThailand"
 */
export function snakeToCamel(str: string): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * แปลง camelCase เป็น snake_case
 * @param str - ข้อความที่ต้องการแปลง
 * @returns string - ข้อความที่แปลงแล้ว
 * 
 * @example
 * camelToSnake('helloWorldFromThailand') // "hello_world_from_thailand"
 */
export function camelToSnake(str: string): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

/**
 * แปลง kebab-case เป็น camelCase
 * @param str - ข้อความที่ต้องการแปลง
 * @returns string - ข้อความที่แปลงแล้ว
 * 
 * @example
 * kebabToCamel('hello-world-from-thailand') // "helloWorldFromThailand"
 */
export function kebabToCamel(str: string): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * ลบช่องว่างที่ไม่จำเป็นออก (leading, trailing, และช่องว่างซ้ำ)
 * @param str - ข้อความที่ต้องการทำความสะอาด
 * @returns string - ข้อความที่สะอาดแล้ว
 * 
 * @example
 * cleanWhitespace('  Hello   World  ') // "Hello World"
 */
export function cleanWhitespace(str: string): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str.trim().replace(/\s+/g, ' ')
}

/**
 * ตรวจสอบว่าข้อความว่างหรือมีแต่ช่องว่าง
 * @param str - ข้อความที่ต้องการตรวจสอบ
 * @returns boolean - true ถ้าว่าง, false ถ้าไม่ว่าง
 * 
 * @example
 * isEmpty('   ') // true
 * isEmpty('Hello') // false
 */
export function isEmpty(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return true
  }

  return str.trim().length === 0
}

/**
 * สร้าง slug จากข้อความ (สำหรับใช้ใน URL)
 * @param str - ข้อความที่ต้องการแปลงเป็น slug
 * @returns string - slug ที่สร้างขึ้น
 * 
 * @example
 * slugify('Hello World from Thailand!') // "hello-world-from-thailand"
 */
export function slugify(str: string): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // ลบอักขระพิเศษ
    .replace(/[\s_]+/g, '-') // แทนที่ช่องว่างด้วย -
    .replace(/^-+|-+$/g, '') // ลบ - ที่ต้นและท้าย
}

/**
 * นับจำนวนคำในข้อความ
 * @param str - ข้อความที่ต้องการนับคำ
 * @returns number - จำนวนคำ
 * 
 * @example
 * countWords('Hello World from Thailand') // 4
 */
export function countWords(str: string): number {
  if (!str || typeof str !== 'string') {
    return 0
  }

  const cleaned = cleanWhitespace(str)
  return cleaned.length === 0 ? 0 : cleaned.split(' ').length
}

/**
 * ตรวจสอบว่าข้อความมีตัวเลขอยู่หรือไม่
 * @param str - ข้อความที่ต้องการตรวจสอบ
 * @returns boolean - true ถ้ามีตัวเลข, false ถ้าไม่มี
 * 
 * @example
 * hasNumbers('Hello123') // true
 * hasNumbers('Hello') // false
 */
export function hasNumbers(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false
  }

  return /\d/.test(str)
}

/**
 * ตรวจสอบว่าข้อความมีอักษรพิเศษหรือไม่
 * @param str - ข้อความที่ต้องการตรวจสอบ
 * @returns boolean - true ถ้ามีอักษรพิเศษ, false ถ้าไม่มี
 * 
 * @example
 * hasSpecialChars('Hello!') // true
 * hasSpecialChars('Hello') // false
 */
export function hasSpecialChars(str: string): boolean {
  if (!str || typeof str !== 'string') {
    return false
  }

  return /[!@#$%^&*(),.?":{}|<>]/.test(str)
}

/**
 * Mask ข้อความ (เช่น email, เบอร์โทร)
 * @param str - ข้อความที่ต้องการ mask
 * @param visibleChars - จำนวนตัวอักษรที่เห็นที่ต้นและท้าย (default: 3)
 * @param maskChar - ตัวอักษรที่ใช้ mask (default: '*')
 * @returns string - ข้อความที่ mask แล้ว
 * 
 * @example
 * maskText('example@email.com', 3) // "exa*****com"
 * maskText('0812345678', 2) // "08******78"
 */
export function maskText(
  str: string,
  visibleChars: number = 3,
  maskChar: string = '*'
): string {
  if (!str || typeof str !== 'string') {
    return ''
  }

  if (str.length <= visibleChars * 2) {
    return str
  }

  const start = str.slice(0, visibleChars)
  const end = str.slice(-visibleChars)
  const maskLength = str.length - visibleChars * 2

  return start + maskChar.repeat(maskLength) + end
}

/**
 * ลบ HTML tags ออกจากข้อความ
 * @param html - HTML string ที่ต้องการลบ tags
 * @returns string - Plain text
 * 
 * @example
 * stripHtmlTags('<p>Hello <strong>World</strong></p>') // "Hello World"
 */
export function stripHtmlTags(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return html.replace(/<[^>]*>/g, '')
}
