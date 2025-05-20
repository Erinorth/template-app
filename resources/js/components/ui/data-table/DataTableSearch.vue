<!-- resources\js\components\ui\data-table\DataTableSearch.vue -->
<script setup lang="ts">
// ใช้ v-model เพื่อให้ reactivity สมบูรณ์
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  modelValue: string
  columns: string[]
  placeholder?: string
}>()
const emit = defineEmits(['update:modelValue'])

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function clear() {
  emit('update:modelValue', '')
}
</script>
<template>
  <div class="flex items-center">
    <Input
      class="max-w-sm"
      :placeholder="placeholder || `Search ${columns.join(' or ')}`"
      v-model="internalValue"
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

