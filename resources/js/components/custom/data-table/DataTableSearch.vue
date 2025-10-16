<script setup lang="ts" generic="T extends object">
import { computed, ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-vue-next'
import { useDebounce } from '@/composables/useDebounce'

// Props definition
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    columns?: (keyof T)[]
    debounceDelay?: number
  }>(),
  {
    debounceDelay: 400,
  }
)

// Events
const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'search', val: string): void
  (e: 'clear'): void
}>()

// Internal ref สำหรับ input value
const internalValue = ref<string>(props.modelValue)

// useDebounce ref - simplified version
const debouncedValue = useDebounce(internalValue, props.debounceDelay)

// v-model binding
const value = computed({
  get: () => internalValue.value,
  set: (v: string) => {
    internalValue.value = v
    emit('update:modelValue', v)
  },
})

// Watch debounced value และ emit search event
watch(debouncedValue, (newValue: string) => {
  console.log('[DataTableSearch] Search debounced:', newValue)
  emit('search', newValue)
})

// Sync กับ parent props
watch(
  () => props.modelValue,
  (newValue: string) => {
    if (internalValue.value !== newValue) {
      internalValue.value = newValue
    }
  }
)

// ฟังก์ชัน clear
function clear() {
  internalValue.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  emit('clear')
}
</script>

<template>
  <div class="flex items-center gap-2 max-w-sm">
    <div class="relative flex-1">
      <!-- Search icon -->
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

      <!-- Input field -->
      <Input
        v-model="value"
        :placeholder="placeholder"
        :columns="columns?.join(',')"
        class="pl-10 pr-10"
      />

      <!-- Clear button -->
      <Button
        v-if="internalValue"
        variant="ghost"
        size="sm"
        @click="clear"
        class="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
      >
        <X class="h-3 w-3" />
      </Button>
    </div>
  </div>
</template>

<!-- หมายเหตุ: simplified useDebounce Ref พร้อม explicit types เพื่อแก้ TypeScript errors -->
