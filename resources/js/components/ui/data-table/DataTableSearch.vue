<script setup lang="ts">
// นำเข้า ref สำหรับ v-model
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// กำหนด props สำหรับ columns ที่จะค้นหา, v-model:search, และ placeholder
const props = defineProps<{
  modelValue: string
  columns: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// ฟังก์ชัน clear ค่าค้นหา
function clear() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="flex items-center">
    <Input
      class="max-w-sm"
      :placeholder="placeholder || `Search ${columns.join(' or ')}`"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <Button
      v-if="modelValue"
      variant="ghost"
      class="ml-2"
      @click="clear"
      size="sm"
    >
      Clear
    </Button>
  </div>
</template>
