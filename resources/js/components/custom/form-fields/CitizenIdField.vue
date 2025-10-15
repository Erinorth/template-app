<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-vue-next'

/**
 * Props สำหรับ CitizenIdField Component
 * - label: ป้ายกำกับของฟิลด์
 * - modelValue: ค่าของ input (รองรับ v-model)
 * - error: ข้อความ error จาก validation
 * - disabled: สถานะ disabled
 * - required: ฟิลด์บังคับหรือไม่
 */
interface Props {
  label?: string
  modelValue: string
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'เลขประจำตัวประชาชน',
  disabled: false,
  required: true,
})

/**
 * Emits สำหรับส่งค่ากลับไปยัง parent component
 */
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/**
 * ฟังก์ชัน format เลขประจำตัวประชาชน
 * จัดรูปแบบให้เป็น X-XXXX-XXXXX-XX-X
 */
function formatCitizenId(value: string): string {
  const cleaned = value.replace(/\D/g, '')
  const limited = cleaned.substring(0, 13)

  if (limited.length <= 1) return limited
  if (limited.length <= 5) return `${limited.substring(0, 1)}-${limited.substring(1)}`
  if (limited.length <= 10) return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5)}`
  if (limited.length <= 12) return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10)}`

  return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10, 12)}-${limited.substring(12)}`
}

/**
 * ฟังก์ชันลบขีดและอักขระพิเศษ เหลือเฉพาะตัวเลข
 */
function cleanCitizenId(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Handle input event และ format ค่า
 */
function handleInput(event: Event) {
  const input = event.target as HTMLInputElement
  const formatted = formatCitizenId(input.value)
  emit('update:modelValue', formatted)
}

/**
 * ตรวจสอบความถูกต้องของเลขประจำตัวประชาชนด้วย checksum
 */
const isCitizenIdValid = computed(() => {
  const cleaned = cleanCitizenId(props.modelValue)

  if (cleaned.length !== 13) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * (13 - i)
  }
  const checkDigit = (11 - (sum % 11)) % 10

  return checkDigit === parseInt(cleaned[12])
})

/**
 * ข้อความแจ้งเตือนสำหรับ validation
 */
const validationMessage = computed(() => {
  if (!props.modelValue) return ''

  const cleaned = cleanCitizenId(props.modelValue)

  if (cleaned.length > 0 && cleaned.length < 13) {
    return `กรุณากรอกให้ครบ 13 หลัก (ป้อนแล้ว ${cleaned.length} หลัก)`
  }

  if (cleaned.length === 13 && !isCitizenIdValid.value) {
    return 'เลขประจำตัวประชาชนไม่ถูกต้อง'
  }

  return ''
})

/**
 * คำนวณ CSS class สำหรับ input
 */
const inputClass = computed(() => ({
  'border-red-500': props.error || (props.modelValue && !isCitizenIdValid.value && cleanCitizenId(props.modelValue).length === 13),
  'border-green-500': props.modelValue && isCitizenIdValid.value && !props.error,
}))

/**
 * คำนวณ CSS class สำหรับข้อความ validation
 */
const messageClass = computed(() => {
  if (props.error) return 'text-red-500'
  if (!isCitizenIdValid.value && cleanCitizenId(props.modelValue).length === 13) {
    return 'text-red-500'
  }
  return 'text-muted-foreground'
})
</script>

<template>
  <div class="space-y-2">
    <!-- Label พร้อมเครื่องหมาย * สำหรับฟิลด์บังคับ -->
    <Label :for="`citizen-id-${$.uid}`">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </Label>

    <!-- Input Field -->
    <Input
      :id="`citizen-id-${$.uid}`"
      :model-value="modelValue"
      type="text"
      placeholder="X-XXXX-XXXXX-XX-X"
      maxlength="17"
      autocomplete="off"
      :class="inputClass"
      :disabled="disabled"
      :required="required"
      @input="handleInput"
    />

    <!-- Error Message จาก Form Validation -->
    <p v-if="error" class="text-sm text-red-500 flex items-center gap-1">
      <AlertCircle class="h-4 w-4" />
      {{ error }}
    </p>

    <!-- Validation Message -->
    <p
      v-else-if="validationMessage"
      :class="['text-sm flex items-center gap-1', messageClass]"
    >
      <AlertCircle
        v-if="!isCitizenIdValid && cleanCitizenId(modelValue).length === 13"
        class="h-4 w-4"
      />
      {{ validationMessage }}
    </p>

    <!-- Helper Text -->
    <p v-else class="text-xs text-muted-foreground">
      กรอกเลขประจำตัวประชาชน 13 หลัก
    </p>
  </div>
</template>
