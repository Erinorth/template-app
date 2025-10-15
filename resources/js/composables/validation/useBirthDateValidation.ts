// ไฟล์: resources/js/composables/useBirthDateValidation.ts
// Composable เฉพาะสำหรับ Birth Date validation

import { type Ref } from 'vue'
import { useFieldValidation, type ValidationRule, type FieldValidation } from './useFormValidation'
import { isPastDate } from '@/lib/formatters/date-formatter'

/**
 * Options สำหรับ Birth Date validation
 */
export interface BirthDateValidationOptions {
  /** Field เป็น required หรือไม่ (default: true) */
  required?: boolean
  
  /** Custom required message */
  requiredMessage?: string
  
  /** Validate เมื่อ value เปลี่ยนทันที (default: true) */
  validateOnChange?: boolean
  
  /** วันเกิดขั้นต่ำ (default: 1900-01-01) */
  minDate?: Date | string
  
  /** วันเกิดสูงสุด (default: today) */
  maxDate?: Date | string
  
  /** อายุขั้นต่ำ (years) */
  minAge?: number
  
  /** อายุสูงสุด (years) (default: 150) */
  maxAge?: number
  
  /** Custom validation rules เพิ่มเติม */
  additionalRules?: ValidationRule<string>[]
}

/**
 * Composable สำหรับ Birth Date validation
 * 
 * @example
 * const birthDate = ref('')
 * const validation = useBirthDateValidation(birthDate, {
 *   minAge: 18,
 *   maxAge: 100
 * })
 */
export function useBirthDateValidation(
  value: Ref<string>,
  options: BirthDateValidationOptions = {}
): FieldValidation {
  console.log('📅 useBirthDateValidation: Initializing', {
    required: options.required ?? true,
    minAge: options.minAge,
    maxAge: options.maxAge ?? 150,
    validateOnChange: options.validateOnChange ?? true
  })

  // Default values
  const minDate = options.minDate ? new Date(options.minDate) : new Date('1900-01-01')
  const maxDate = options.maxDate ? new Date(options.maxDate) : new Date()
  const maxAge = options.maxAge ?? 150

  // สร้าง validation rules สำหรับ Birth Date
  const rules: ValidationRule<string>[] = [
    // Rule 1: ต้องเป็นวันที่ในอดีต
    {
      name: 'past-date',
      validator: (val: string) => {
        if (!val) return true // Skip ถ้าค่าว่าง (จะถูก catch ใน required)
        return isPastDate(val)
      },
      message: 'วันเกิดต้องเป็นวันที่ในอดีต'
    },
    
    // Rule 2: ต้องหลังปี 1900
    {
      name: 'min-date',
      validator: (val: string) => {
        if (!val) return true
        const birthDate = new Date(val)
        return birthDate >= minDate
      },
      message: `วันเกิดต้องหลัง ${minDate.getFullYear()}`
    },
    
    // Rule 3: ต้องไม่เกินวันนี้
    {
      name: 'max-date',
      validator: (val: string) => {
        if (!val) return true
        const birthDate = new Date(val)
        return birthDate <= maxDate
      },
      message: 'วันเกิดต้องไม่เกินวันปัจจุบัน'
    },
    
    // Rule 4: ตรวจสอบอายุขั้นต่ำ (ถ้ากำหนด)
    ...(options.minAge ? [{
      name: 'min-age',
      validator: (val: string) => {
        if (!val) return true
        const birthDate = new Date(val)
        const age = calculateAge(birthDate)
        return age >= options.minAge!
      },
      message: `อายุต้องมากกว่า ${options.minAge} ปี`
    }] : []),
    
    // Rule 5: ตรวจสอบอายุสูงสุด
    {
      name: 'max-age',
      validator: (val: string) => {
        if (!val) return true
        const birthDate = new Date(val)
        const age = calculateAge(birthDate)
        return age <= maxAge
      },
      message: `อายุต้องไม่เกิน ${maxAge} ปี (วันเกิดไม่สมเหตุสมผล)`
    },
    
    // Rule 6: ตรวจสอบว่าเป็น valid date
    {
      name: 'valid-date',
      validator: (val: string) => {
        if (!val) return true
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      message: 'วันที่ไม่ถูกต้อง'
    }
  ]

  // เพิ่ม additional rules ถ้ามี
  if (options.additionalRules) {
    rules.push(...options.additionalRules)
  }

  // ใช้ useFieldValidation พร้อมกับ rules ที่สร้าง
  return useFieldValidation(value, {
    required: options.required ?? true,
    requiredMessage: options.requiredMessage || 'กรุณาเลือกวันเกิด',
    rules,
    validateOnChange: options.validateOnChange ?? true,
    isEmpty: (val) => !val || val.trim() === ''
  })
}

/**
 * Helper function: คำนวณอายุจากวันเกิด
 */
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

/**
 * Helper function สำหรับ validation แบบ standalone
 */
export function validateBirthDate(value: string, options: BirthDateValidationOptions = {}): {
  isValid: boolean
  error: string
} {
  if (!value || value.trim() === '') {
    return {
      isValid: !options.required,
      error: options.required ? (options.requiredMessage || 'กรุณาเลือกวันเกิด') : ''
    }
  }

  const birthDate = new Date(value)

  // ตรวจสอบ valid date
  if (isNaN(birthDate.getTime())) {
    return {
      isValid: false,
      error: 'วันที่ไม่ถูกต้อง'
    }
  }

  // ตรวจสอบว่าเป็นอดีต
  if (!isPastDate(birthDate)) {
    return {
      isValid: false,
      error: 'วันเกิดต้องเป็นวันที่ในอดีต'
    }
  }

  // ตรวจสอบขั้นต่ำ
  const minDate = options.minDate ? new Date(options.minDate) : new Date('1900-01-01')
  if (birthDate < minDate) {
    return {
      isValid: false,
      error: `วันเกิดต้องหลัง ${minDate.getFullYear()}`
    }
  }

  // ตรวจสอบอายุ
  const age = calculateAge(birthDate)
  const maxAge = options.maxAge ?? 150

  if (options.minAge && age < options.minAge) {
    return {
      isValid: false,
      error: `อายุต้องมากกว่า ${options.minAge} ปี`
    }
  }

  if (age > maxAge) {
    return {
      isValid: false,
      error: `อายุต้องไม่เกิน ${maxAge} ปี`
    }
  }

  return {
    isValid: true,
    error: ''
  }
}
