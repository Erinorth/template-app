<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-vue-next'

/**
 * Props สำหรับ BirthDateField Component
 */
interface Props {
  label?: string
  modelValue: string
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'วันเกิด',
  disabled: false,
  required: false,
})

/**
 * Emits สำหรับส่งค่ากลับ
 */
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

/**
 * Handle input event
 */
function handleInput(event: Event) {
  const input = event.target as HTMLInputElement
  emit('update:modelValue', input.value)
}

/**
 * ตรวจสอบความถูกต้องของวันเกิด
 */
const validationMessage = computed(() => {
  if (!props.modelValue) return ''

  const birthDate = new Date(props.modelValue)
  const today = new Date()

  if (birthDate >= today) {
    return 'วันเกิดต้องเป็นวันที่ในอดีต'
  }

  const year1900 = new Date('1900-01-01')
  if (birthDate < year1900) {
    return 'วันเกิดต้องหลังปี ค.ศ. 1900'
  }

  const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))

  if (age > 150) {
    return 'วันเกิดไม่สมเหตุสมผล'
  }

  return `อายุ ${age} ปี`
})

/**
 * คำนวณ CSS class สำหรับ input
 */
const inputClass = computed(() => ({
  'border-red-500': props.error || (props.modelValue && validationMessage.value.includes('ต้อง')),
}))

/**
 * คำนวณ CSS class สำหรับข้อความ validation
 */
const messageClass = computed(() => {
  if (props.error) return 'text-red-500'
  if (validationMessage.value.includes('ต้อง') || validationMessage.value.includes('ไม่สมเหตุสมผล')) {
    return 'text-red-500'
  }
  return 'text-muted-foreground'
})

/**
 * คำนวณค่า max date (วันปัจจุบัน)
 */
const maxDate = computed(() => new Date().toISOString().split('T')[0])
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <Label :for="`birth-date-${$.uid}`">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </Label>

    <!-- Input Field -->
    <Input
      :id="`birth-date-${$.uid}`"
      :model-value="modelValue"
      type="date"
      :max="maxDate"
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
    <p v-else-if="validationMessage" :class="['text-sm', messageClass]">
      {{ validationMessage }}
    </p>

    <!-- Helper Text -->
    <p v-else class="text-xs text-muted-foreground">
      เลือกวันเกิดของประชาชน
    </p>
  </div>
</template>
