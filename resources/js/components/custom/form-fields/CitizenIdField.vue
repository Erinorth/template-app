<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-vue-next'
// นำเข้าฟังก์ชันจาก utils แทนการประกาศใหม่
import { formatThaiCitizenId, isValidThaiCitizenId } from '@/lib/utils'

// Props สำหรับ CitizenIdField Component
interface Props {
  label?: string
  modelValue: string
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'เลขบัตรประชาชน',
  disabled: false,
  required: true,
})

// Emits สำหรับส่งค่ากลับไปยัง parent component
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// ฟังก์ชันลบอักขระที่ไม่ใช่ตัวเลข
function cleanCitizenId(value: string): string {
  return value.replace(/\D/g, '')
}

// Handle input event และจัดรูปแบบ
function handleInput(event: Event) {
  const input = event.target as HTMLInputElement
  // ใช้ formatThaiCitizenId จาก utils
  const formatted = formatThaiCitizenId(input.value)
  emit('update:modelValue', formatted)
}

// ตรวจสอบความถูกต้องของเลขบัตรประชาชนด้วย checksum
const isCitizenIdValid = computed(() => {
  const cleaned = cleanCitizenId(props.modelValue)
  if (cleaned.length !== 13) return false
  // ใช้ isValidThaiCitizenId จาก utils
  return isValidThaiCitizenId(cleaned)
})

// ข้อความแสดงผลการตรวจสอบ validation
const validationMessage = computed(() => {
  if (!props.modelValue) return ''

  const cleaned = cleanCitizenId(props.modelValue)

  if (cleaned.length > 0 && cleaned.length < 13) {
    return `กรุณากรอกให้ครบ 13 หลัก (ปัจจุบัน ${cleaned.length} หลัก)`
  }

  if (cleaned.length === 13 && !isCitizenIdValid.value) {
    return 'เลขบัตรประชาชนไม่ถูกต้อง'
  }

  return ''
})

// CSS class สำหรับ input ตามสถานะ
const inputClass = computed(() => ({
  'border-red-500':
    props.error ||
    (props.modelValue &&
      !isCitizenIdValid.value &&
      cleanCitizenId(props.modelValue).length === 13),
  'border-green-500':
    props.modelValue && isCitizenIdValid.value && !props.error,
}))

// CSS class สำหรับข้อความ validation
const messageClass = computed(() => {
  if (props.error) return 'text-red-500'
  if (
    !isCitizenIdValid.value &&
    cleanCitizenId(props.modelValue).length === 13
  )
    return 'text-red-500'
  return 'text-muted-foreground'
})
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <Label :for="`citizen-id-${$.uid}`">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
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
      class="text-sm flex items-center gap-1"
      :class="messageClass"
    >
      <AlertCircle
        v-if="!isCitizenIdValid && cleanCitizenId(modelValue).length === 13"
        class="h-4 w-4"
      />
      {{ validationMessage }}
    </p>

    <!-- Helper Text -->
    <p v-else class="text-xs text-muted-foreground">
      กรุณากรอกเลขบัตรประชาชน 13 หลัก
    </p>
  </div>
</template>
