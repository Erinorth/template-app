<script setup lang="ts" generic="T extends object">
// สร้าง component สำหรับ input search แบบ generic
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-vue-next'

// props สำหรับ search (รองรับ model generic)
const props = defineProps<{
  modelValue: string
  placeholder?: string
  columns?: (keyof T)[]
}>()
const emit = defineEmits<{ 
  (e: 'update:modelValue', val: string): void
  (e: 'clear'): void
}>()
// v-model generic
const value = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
// กด clear
function clear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="flex items-center gap-2 max-w-sm">
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        v-model="value"
        :placeholder="placeholder || ('ค้นหา ' + (columns?.join(' / ') || ''))"
        class="pl-10 pr-10"
      />
      <Button
        v-if="modelValue"
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

<!--
คอมเมนต์:
- รับผิดชอบเฉพาะการค้นหา แบบ generic ใช้กับ model อื่นได้
- ไม่ควรมี logic ในหน้าที่อื่นแทรก
-->
