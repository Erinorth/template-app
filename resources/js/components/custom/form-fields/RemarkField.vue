<script setup lang="ts">
import { computed } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-vue-next'

/**
 * Props สำหรับ RemarkField Component
 */
interface Props {
  label?: string
  modelValue: string
  error?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
  rows?: number
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: 'หมายเหตุ',
  disabled: false,
  required: false,
  placeholder: 'กรอกหมายเหตุเพิ่มเติม (ถ้ามี)',
  rows: 4,
  maxLength: 1000,
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
  const textarea = event.target as HTMLTextAreaElement
  emit('update:modelValue', textarea.value)
}

/**
 * คำนวณจำนวนตัวอักษรที่กรอก
 */
const characterCount = computed(() => props.modelValue?.length || 0)

/**
 * คำนวณ CSS class สำหรับ textarea
 */
const textareaClass = computed(() => ({
  'border-red-500': props.error,
}))
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <Label :for="`remark-${$.uid}`">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </Label>

    <!-- Textarea Field -->
    <Textarea
      :id="`remark-${$.uid}`"
      :model-value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxLength"
      :class="textareaClass"
      :disabled="disabled"
      :required="required"
      @input="handleInput"
    />

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-red-500 flex items-center gap-1">
      <AlertCircle class="h-4 w-4" />
      {{ error }}
    </p>

    <!-- Character Count -->
    <p v-else class="text-xs text-muted-foreground flex items-center justify-between">
      <span>กรอกหมายเหตุหรือข้อมูลเพิ่มเติม</span>
      <span>{{ characterCount }}/{{ maxLength }}</span>
    </p>
  </div>
</template>
