// ไฟล์: resources/js/composables/useFormValidation.ts
// Core Composable สำหรับจัดการ validation แบบ reusable และ type-safe

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

// ======= TYPE DEFINITIONS =======

/**
 * Interface สำหรับ Validation Rule
 */
export interface ValidationRule<T = any> {
  /** ฟังก์ชัน validator ที่ return true ถ้าผ่าน validation */
  validator: (value: T) => boolean | Promise<boolean>
  
  /** Error message หรือ function ที่ return error message */
  message: string | ((value: T) => string)
  
  /** ชื่อของ rule (สำหรับ debugging) */
  name?: string
}

/**
 * Options สำหรับ useFieldValidation
 */
export interface FieldValidationOptions<T = any> {
  /** Validation rules array */
  rules?: ValidationRule<T>[]
  
  /** Field เป็น required หรือไม่ */
  required?: boolean
  
  /** Custom required message */
  requiredMessage?: string
  
  /** Validate เมื่อ value เปลี่ยนทันที (default: false, จะ validate หลัง touch) */
  validateOnChange?: boolean
  
  /** Debounce time สำหรับ validation (milliseconds) */
  debounce?: number
  
  /** Custom empty check function */
  isEmpty?: (value: T) => boolean
}

/**
 * Return type ของ useFieldValidation
 */
export interface FieldValidation {
  /** Error message ปัจจุบัน */
  error: ComputedRef<string>
  
  /** สถานะว่า field valid หรือไม่ */
  isValid: ComputedRef<boolean>
  
  /** สถานะว่า field ถูก touch แล้วหรือยัง */
  touched: ComputedRef<boolean>
  
  /** สถานะว่ากำลัง validate อยู่หรือไม่ (สำหรับ async validation) */
  isValidating: ComputedRef<boolean>
  
  /** ฟังก์ชัน validate field */
  validate: () => Promise<boolean>
  
  /** Mark field as touched */
  touch: () => void
  
  /** Reset validation state */
  reset: () => void
  
  /** Force set error message */
  setError: (message: string) => void
  
  /** Clear error message */
  clearError: () => void
}

// ======= MAIN COMPOSABLE =======

/**
 * Composable สำหรับจัดการ validation ของ field เดียว
 * 
 * @example
 * const value = ref('')
 * const validation = useFieldValidation(value, {
 *   required: true,
 *   rules: [
 *     {
 *       validator: (val) => val.length >= 3,
 *       message: 'ต้องมีอย่างน้อย 3 ตัวอักษร'
 *     }
 *   ]
 * })
 */
export function useFieldValidation<T = any>(
  value: Ref<T>,
  options: FieldValidationOptions<T> = {}
): FieldValidation {
  console.log('🔍 useFieldValidation: Initializing validation', {
    hasRules: !!options.rules,
    rulesCount: options.rules?.length || 0,
    required: options.required,
    validateOnChange: options.validateOnChange
  })

  // ======= STATE =======
  const error = ref<string>('')
  const isValid = ref<boolean>(true)
  const touched = ref<boolean>(false)
  const isValidating = ref<boolean>(false)

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // ======= HELPER FUNCTIONS =======

  /**
   * ตรวจสอบว่าค่าว่างหรือไม่
   */
  const checkIsEmpty = (val: T): boolean => {
    if (options.isEmpty) {
      return options.isEmpty(val)
    }

    // Default empty check
    if (val === null || val === undefined) return true
    if (typeof val === 'string') return val.trim() === ''
    if (Array.isArray(val)) return val.length === 0
    if (typeof val === 'object') return Object.keys(val).length === 0
    
    return false
  }

  /**
   * ฟังก์ชัน validate field (async support)
   */
  const validate = async (): Promise<boolean> => {
    // ถ้ายังไม่ถูก touch และไม่ได้ set validateOnChange ให้ข้ามการ validate
    if (!touched.value && !options.validateOnChange) {
      return true
    }

    console.log('🔍 useFieldValidation: Validating field', {
      value: value.value,
      isEmpty: checkIsEmpty(value.value),
      touched: touched.value
    })

    isValidating.value = true

    try {
      // ตรวจสอบ required
      if (options.required && checkIsEmpty(value.value)) {
        error.value = options.requiredMessage || 'กรุณากรอกข้อมูล'
        isValid.value = false
        console.log('❌ useFieldValidation: Required validation failed')
        return false
      }

      // ถ้าค่าว่างและไม่ required ให้ผ่าน
      if (checkIsEmpty(value.value) && !options.required) {
        error.value = ''
        isValid.value = true
        console.log('✅ useFieldValidation: Empty value (not required) - pass')
        return true
      }

      // ตรวจสอบ rules ทั้งหมด
      if (options.rules) {
        for (const rule of options.rules) {
          const result = await rule.validator(value.value)
          
          if (!result) {
            error.value = typeof rule.message === 'function' 
              ? rule.message(value.value) 
              : rule.message
            isValid.value = false
            
            console.log('❌ useFieldValidation: Rule validation failed', {
              ruleName: rule.name,
              error: error.value
            })
            
            return false
          }
        }
      }

      // ถ้าผ่านทุก validation
      error.value = ''
      isValid.value = true
      console.log('✅ useFieldValidation: All validations passed')
      return true

    } catch (err) {
      console.error('❌ useFieldValidation: Validation error', err)
      error.value = 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล'
      isValid.value = false
      return false

    } finally {
      isValidating.value = false
    }
  }

  /**
   * Validate with debounce
   */
  const validateWithDebounce = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (options.debounce && options.debounce > 0) {
      debounceTimer = setTimeout(() => {
        validate()
      }, options.debounce)
    } else {
      validate()
    }
  }

  /**
   * Mark field as touched
   */
  const touch = () => {
    if (!touched.value) {
      console.log('👆 useFieldValidation: Field touched')
      touched.value = true
      validate()
    }
  }

  /**
   * Reset validation state
   */
  const reset = () => {
    console.log('🔄 useFieldValidation: Reset validation state')
    error.value = ''
    isValid.value = true
    touched.value = false
    isValidating.value = false
    
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  /**
   * Force set error message
   */
  const setError = (message: string) => {
    console.log('⚠️ useFieldValidation: Set error', message)
    error.value = message
    isValid.value = false
    touched.value = true
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    console.log('🧹 useFieldValidation: Clear error')
    error.value = ''
    isValid.value = true
  }

  // ======= WATCHERS =======

  /**
   * Auto validate เมื่อค่าเปลี่ยนแปลง
   * - ถ้า validateOnChange = true: validate ทันที
   * - ถ้า touched = true: validate ทันที
   */
  watch(value, () => {
    if (options.validateOnChange || touched.value) {
      validateWithDebounce()
    }
  })

  // ======= RETURN =======
  return {
    error: computed(() => error.value),
    isValid: computed(() => isValid.value),
    touched: computed(() => touched.value),
    isValidating: computed(() => isValidating.value),
    validate,
    touch,
    reset,
    setError,
    clearError
  }
}

// ======= FORM VALIDATION =======

/**
 * Interface สำหรับ form validation
 */
export interface FormValidation {
  /** สถานะว่า form valid หรือไม่ */
  isValid: ComputedRef<boolean>
  
  /** สถานะว่ากำลัง validate อยู่หรือไม่ */
  isValidating: ComputedRef<boolean>
  
  /** Validate form ทั้งหมด */
  validate: () => Promise<boolean>
  
  /** Reset form validation */
  reset: () => void
  
  /** Touch all fields */
  touchAll: () => void
  
  /** Get all errors */
  getErrors: () => Record<string, string>
}

/**
 * Composable สำหรับจัดการ validation ของ form ทั้งหมด
 * 
 * @example
 * const nameValidation = useFieldValidation(name, {...})
 * const emailValidation = useFieldValidation(email, {...})
 * 
 * const formValidation = useFormValidation({
 *   name: nameValidation,
 *   email: emailValidation
 * })
 */
export function useFormValidation(
  fields: Record<string, FieldValidation>
): FormValidation {
  console.log('📋 useFormValidation: Initializing form validation', {
    fieldsCount: Object.keys(fields).length,
    fields: Object.keys(fields)
  })

  /**
   * Check if form is valid
   */
  const isValid = computed(() => {
    return Object.values(fields).every(field => field.isValid.value)
  })

  /**
   * Check if any field is validating
   */
  const isValidating = computed(() => {
    return Object.values(fields).some(field => field.isValidating.value)
  })

  /**
   * Validate all fields
   */
  const validate = async (): Promise<boolean> => {
    console.log('📋 useFormValidation: Validating all fields')
    
    const results = await Promise.all(
      Object.entries(fields).map(async ([name, field]) => {
        const result = await field.validate()
        console.log(`📋 useFormValidation: Field "${name}" validation:`, result)
        return result
      })
    )

    const allValid = results.every(result => result)
    console.log('📋 useFormValidation: Form validation result:', allValid)
    
    return allValid
  }

  /**
   * Reset all fields
   */
  const reset = () => {
    console.log('📋 useFormValidation: Reset all fields')
    Object.values(fields).forEach(field => field.reset())
  }

  /**
   * Touch all fields
   */
  const touchAll = () => {
    console.log('📋 useFormValidation: Touch all fields')
    Object.values(fields).forEach(field => field.touch())
  }

  /**
   * Get all errors
   */
  const getErrors = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    
    Object.entries(fields).forEach(([name, field]) => {
      if (field.error.value) {
        errors[name] = field.error.value
      }
    })

    console.log('📋 useFormValidation: Get errors', errors)
    return errors
  }

  return {
    isValid,
    isValidating,
    validate,
    reset,
    touchAll,
    getErrors
  }
}
