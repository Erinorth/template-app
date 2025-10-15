// ไฟล์: resources/js/composables/useTextValidation.ts
// Composable เฉพาะสำหรับ Text field validation

import { type Ref } from 'vue'
import { useFieldValidation, type ValidationRule, type FieldValidation } from './useFormValidation'

/**
 * Options สำหรับ Text validation
 */
export interface TextValidationOptions {
  /** Field เป็น required หรือไม่ */
  required?: boolean
  
  /** Custom required message */
  requiredMessage?: string
  
  /** ความยาวขั้นต่ำ */
  minLength?: number
  
  /** ความยาวสูงสุด */
  maxLength?: number
  
  /** Pattern (RegExp) ที่ต้องการ match */
  pattern?: RegExp
  
  /** Error message สำหรับ pattern */
  patternMessage?: string
  
  /** Validate เมื่อ value เปลี่ยนทันที */
  validateOnChange?: boolean
  
  /** Debounce time (milliseconds) */
  debounce?: number
  
  /** Custom validation rules เพิ่มเติม */
  additionalRules?: ValidationRule<string>[]
}

/**
 * Composable สำหรับ Text field validation
 * 
 * @example
 * const remark = ref('')
 * const validation = useTextValidation(remark, {
 *   required: false,
 *   maxLength: 1000
 * })
 */
export function useTextValidation(
  value: Ref<string>,
  options: TextValidationOptions = {}
): FieldValidation {
  console.log('📝 useTextValidation: Initializing', {
    required: options.required,
    minLength: options.minLength,
    maxLength: options.maxLength,
    hasPattern: !!options.pattern
  })

  // สร้าง validation rules
  const rules: ValidationRule<string>[] = []

  // Rule: ความยาวขั้นต่ำ
  if (options.minLength !== undefined) {
    rules.push({
      name: 'min-length',
      validator: (val: string) => {
        if (!val) return true // Skip ถ้าว่าง
        return val.trim().length >= options.minLength!
      },
      message: `ต้องมีอย่างน้อย ${options.minLength} ตัวอักษร`
    })
  }

  // Rule: ความยาวสูงสุด
  if (options.maxLength !== undefined) {
    rules.push({
      name: 'max-length',
      validator: (val: string) => {
        if (!val) return true
        return val.length <= options.maxLength!
      },
      message: `ต้องไม่เกิน ${options.maxLength} ตัวอักษร`
    })
  }

  // Rule: Pattern matching
  if (options.pattern) {
    rules.push({
      name: 'pattern',
      validator: (val: string) => {
        if (!val) return true
        return options.pattern!.test(val)
      },
      message: options.patternMessage || 'รูปแบบไม่ถูกต้อง'
    })
  }

  // เพิ่ม additional rules
  if (options.additionalRules) {
    rules.push(...options.additionalRules)
  }

  return useFieldValidation(value, {
    required: options.required ?? false,
    requiredMessage: options.requiredMessage,
    rules,
    validateOnChange: options.validateOnChange ?? false,
    debounce: options.debounce,
    isEmpty: (val) => !val || val.trim() === ''
  })
}

/**
 * Preset: Email validation
 */
export function useEmailValidation(
  value: Ref<string>,
  options: Omit<TextValidationOptions, 'pattern' | 'patternMessage'> = {}
): FieldValidation {
  return useTextValidation(value, {
    ...options,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'รูปแบบอีเมลไม่ถูกต้อง'
  })
}

/**
 * Preset: Phone validation (Thai)
 */
export function usePhoneValidation(
  value: Ref<string>,
  options: Omit<TextValidationOptions, 'pattern' | 'patternMessage'> = {}
): FieldValidation {
  return useTextValidation(value, {
    ...options,
    pattern: /^(06|08|09)\d{8}$|^(02|03[2-9]|04[2-5]|05[2-6]|07[3-7])\d{7}$/,
    patternMessage: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง'
  })
}

/**
 * Preset: URL validation
 */
export function useUrlValidation(
  value: Ref<string>,
  options: Omit<TextValidationOptions, 'pattern' | 'patternMessage'> = {}
): FieldValidation {
  return useTextValidation(value, {
    ...options,
    additionalRules: [
      {
        name: 'valid-url',
        validator: (val: string) => {
          if (!val) return true
          try {
            new URL(val)
            return true
          } catch {
            return false
          }
        },
        message: 'URL ไม่ถูกต้อง'
      }
    ]
  })
}
