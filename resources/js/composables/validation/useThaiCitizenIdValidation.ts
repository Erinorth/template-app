// ไฟล์: resources/js/composables/useThaiCitizenIdValidation.ts
// Composable เฉพาะสำหรับ Thai Citizen ID validation

import { type Ref } from 'vue'
import { useFieldValidation, type ValidationRule, type FieldValidation } from './useFormValidation'
import { isValidThaiCitizenId, cleanThaiCitizenId } from '@/lib/formatters/thai-id-formatter'

/**
 * Options สำหรับ Thai Citizen ID validation
 */
export interface ThaiCitizenIdValidationOptions {
  /** Field เป็น required หรือไม่ (default: true) */
  required?: boolean
  
  /** Custom required message */
  requiredMessage?: string
  
  /** Validate เมื่อ value เปลี่ยนทันที (default: false) */
  validateOnChange?: boolean
  
  /** Debounce time (milliseconds) */
  debounce?: number
  
  /** Custom validation rules เพิ่มเติม */
  additionalRules?: ValidationRule<string>[]
}

/**
 * Composable สำหรับ Thai Citizen ID validation
 * 
 * @example
 * const citizenId = ref('')
 * const validation = useThaiCitizenIdValidation(citizenId)
 * 
 * // ใช้ใน component
 * <Input v-model="citizenId" :error="validation.error.value" @blur="validation.touch()" />
 */
export function useThaiCitizenIdValidation(
  value: Ref<string>,
  options: ThaiCitizenIdValidationOptions = {}
): FieldValidation {
  console.log('🆔 useThaiCitizenIdValidation: Initializing', {
    required: options.required ?? true,
    validateOnChange: options.validateOnChange,
    hasAdditionalRules: !!options.additionalRules
  })

  // สร้าง validation rules สำหรับ Thai Citizen ID
  const rules: ValidationRule<string>[] = [
    // Rule 1: ตรวจสอบความยาว 13 หลัก
    {
      name: 'length',
      validator: (val: string) => {
        const cleaned = cleanThaiCitizenId(val)
        return cleaned.length === 13
      },
      message: (val: string) => {
        const cleaned = cleanThaiCitizenId(val)
        return `กรุณากรอกให้ครบ 13 หลัก (ปัจจุบัน ${cleaned.length} หลัก)`
      }
    },
    
    // Rule 2: ตรวจสอบ checksum
    {
      name: 'checksum',
      validator: (val: string) => {
        const cleaned = cleanThaiCitizenId(val)
        
        // ถ้ายังไม่ครบ 13 หลัก ให้ข้าม rule นี้ (จะถูก catch ใน rule แรก)
        if (cleaned.length !== 13) return true
        
        return isValidThaiCitizenId(cleaned)
      },
      message: 'เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)'
    }
  ]

  // เพิ่ม additional rules ถ้ามี
  if (options.additionalRules) {
    rules.push(...options.additionalRules)
  }

  // ใช้ useFieldValidation พร้อมกับ rules ที่สร้าง
  return useFieldValidation(value, {
    required: options.required ?? true,
    requiredMessage: options.requiredMessage || 'กรุณากรอกเลขบัตรประชาชน',
    rules,
    validateOnChange: options.validateOnChange ?? false,
    debounce: options.debounce,
    isEmpty: (val) => {
      const cleaned = cleanThaiCitizenId(val)
      return cleaned.length === 0
    }
  })
}

/**
 * Helper function สำหรับ validation แบบ standalone
 * (ไม่ใช้ reactive ref)
 */
export function validateThaiCitizenId(value: string): {
  isValid: boolean
  error: string
} {
  const cleaned = cleanThaiCitizenId(value)

  if (cleaned.length === 0) {
    return {
      isValid: false,
      error: 'กรุณากรอกเลขบัตรประชาชน'
    }
  }

  if (cleaned.length !== 13) {
    return {
      isValid: false,
      error: `กรุณากรอกให้ครบ 13 หลัก (ปัจจุบัน ${cleaned.length} หลัก)`
    }
  }

  if (!isValidThaiCitizenId(cleaned)) {
    return {
      isValid: false,
      error: 'เลขบัตรประชาชนไม่ถูกต้อง'
    }
  }

  return {
    isValid: true,
    error: ''
  }
}
