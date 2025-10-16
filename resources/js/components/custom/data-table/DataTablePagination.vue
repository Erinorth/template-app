<script setup lang="ts">
import { computed } from 'vue'
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ServerPaginationProps, PaginationLink } from '@/types/pagination'

// Props interface
interface Props extends ServerPaginationProps {}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [10, 20, 50, 100],
  links: () => [] as PaginationLink[],
})

// Events
const emit = defineEmits<{
  (e: 'changepage', page: number): void
  (e: 'changepageSize', size: number): void
}>()

// ตรวจสอบว่าสามารถไปหน้าก่อนหน้าได้หรือไม่
const canPrev = computed(() => props.currentPage > 1)

// ตรวจสอบว่าสามารถไปหน้าถัดไปได้หรือไม่
const canNext = computed(() => props.currentPage < props.totalPages)

// ฟังก์ชันไปหน้าแรก
function goFirst() {
  if (props.currentPage !== 1) {
    console.log('[DataTablePagination] Go to first page')
    emit('changepage', 1)
  }
}

// ฟังก์ชันไปหน้าก่อนหน้า
function goPrev() {
  if (canPrev.value) {
    console.log('[DataTablePagination] Go to previous page')
    emit('changepage', props.currentPage - 1)
  }
}

// ฟังก์ชันไปหน้าถัดไป
function goNext() {
  if (canNext.value) {
    console.log('[DataTablePagination] Go to next page')
    emit('changepage', props.currentPage + 1)
  }
}

// ฟังก์ชันไปหน้าสุดท้าย
function goLast() {
  if (props.currentPage !== props.totalPages) {
    console.log('[DataTablePagination] Go to last page')
    emit('changepage', props.totalPages)
  }
}

// ฟังก์ชันเปลี่ยนขนาดหน้า - รองรับ AcceptableValue type แบบเต็ม (รวม Record<string, any>)
function onChangePageSize(value: string | number | boolean | bigint | Record<string, any> | null | undefined) {
  // ตรวจสอบ null/undefined
  if (value === null || value === undefined) {
    console.warn('[DataTablePagination] Null or undefined page size value')
    return
  }

  // ตรวจสอบ empty string
  if (value === '') {
    console.warn('[DataTablePagination] Empty string page size value')
    return
  }

  // แปลงเป็น number
  let size: number

  if (typeof value === 'string') {
    size = Number(value)
  } else if (typeof value === 'number') {
    size = value
  } else if (typeof value === 'bigint') {
    size = Number(value)
  } else if (typeof value === 'boolean') {
    console.warn('[DataTablePagination] Boolean value not supported for page size:', value)
    return
  } else if (typeof value === 'object') {
    // Handle Record<string, any> case
    console.warn('[DataTablePagination] Object value not supported for page size:', value)
    return
  } else {
    console.warn('[DataTablePagination] Unsupported value type:', typeof value, value)
    return
  }

  // ตรวจสอบว่าเป็นตัวเลขที่ valid
  if (isNaN(size) || size <= 0) {
    console.warn('[DataTablePagination] Invalid numeric page size:', value)
    return
  }

  console.log('[DataTablePagination] Change page size to:', size)
  emit('changepageSize', size)
}

// ตรวจสอบว่า label เป็นตัวเลขหรือไม่
function isNumericLabel(label: string): boolean {
  return /^\d+$/.test(label)
}
</script>

<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <!-- แสดงข้อมูล range -->
    <div class="flex flex-col gap-2 text-sm text-muted-foreground lg:flex-row lg:items-center">
      <span>แสดง {{ (from ?? 0).toLocaleString() }} - {{ (to ?? 0).toLocaleString() }} จาก {{ total.toLocaleString() }} รายการ</span>
    </div>

    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
      <!-- เลือกจำนวนรายการต่อหน้า -->
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-muted-foreground whitespace-nowrap">รายการต่อหน้า</span>

        <Select
          :model-value="pageSize.toString()"
          @update:model-value="onChangePageSize"
        >
          <SelectTrigger class="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="size in pageSizeOptions"
              :key="size"
              :value="size.toString()"
            >
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- ปุ่ม Pagination -->
      <div class="flex items-center gap-2">
        <!-- ไปหน้าแรก -->
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!canPrev"
          @click="goFirst"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>

        <!-- ไปหน้าก่อนหน้า -->
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!canPrev"
          @click="goPrev"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <!-- ปุ่มเลขหน้า -->
        <template v-for="(link, i) in links" :key="i">
          <Button
            v-if="isNumericLabel(link.label)"
            :variant="link.active ? 'default' : 'outline'"
            size="sm"
            :disabled="!link.url"
            @click="() => emit('changepage', Number(link.label))"
          >
            {{ link.label }}
          </Button>
        </template>

        <!-- ไปหน้าถัดไป -->
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!canNext"
          @click="goNext"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>

        <!-- ไปหน้าสุดท้าย -->
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!canNext"
          @click="goLast"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>

        <!-- แสดงหน้าปัจจุบัน/ทั้งหมด -->
        <div class="flex items-center gap-1 px-2">
          <span class="text-sm font-medium">{{ currentPage }} / {{ totalPages }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
