<!-- 
  ไฟล์: resources/js/components/ui/data-table/DataTablePagination.vue
  ปรับแก้ไขให้ปลอดภัยกับ TypeScript และไม่มี warning กรณี table undefined
  แสดง DataTableSelected เฉพาะเมื่อมี column checkbox สำหรับเลือกแถวเท่านั้น
-->

<script setup lang="ts">
// นำเข้า type Table จาก @tanstack/vue-table สำหรับจัดการ state ตาราง
import type { Table } from '@tanstack/vue-table'

// นำเข้า icon ที่จำเป็นจาก lucide-vue-next
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft as DoubleArrowLeftIcon,
  ChevronsRight as DoubleArrowRightIcon
} from 'lucide-vue-next'

// นำเข้า Button และ Select component สำหรับ UI
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { computed } from 'vue'
import DataTableSelected from './DataTableSelected.vue'

// รับ prop table (object จาก @tanstack/vue-table) แบบ required
const props = defineProps<{
  table: Table<any>
}>()

// ตรวจสอบว่ามีคอลัมน์ checkbox สำหรับเลือกแถวหรือไม่ (type safe)
const hasRowSelectionColumn = computed(() => {
  return props.table?.getAllColumns().some((col: { id?: string }) => col.id === 'select')
})
</script>

<template>
  <!-- แสดงจำนวนแถวที่ถูกเลือกเทียบกับจำนวนแถวทั้งหมดหลังกรอง เฉพาะเมื่อมีคอลัมน์ select -->
  <DataTableSelected v-if="hasRowSelectionColumn" :table="props.table" />

  <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-2 w-full">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:space-x-6 lg:space-x-8 w-full">
      <!-- ส่วนเลือกจำนวนแถวต่อหน้า -->
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">Rows per page</p>
        <Select
          :model-value="`${props.table.getState().pagination.pageSize}`"
          @update:model-value="(value) => value !== null && props.table.setPageSize(Number(value))"
        >
          <SelectTrigger class="h-8 w-[70px]">
            <SelectValue :placeholder="`${props.table.getState().pagination.pageSize}`" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem v-for="pageSize in [10, 20, 30, 40, 50]" :key="pageSize" :value="`${pageSize}`">
              {{ pageSize }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <!-- แสดงหน้าปัจจุบัน/จำนวนหน้าทั้งหมด -->
      <div class="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {{ props.table.getState().pagination.pageIndex + 1 }} of
        {{ props.table.getPageCount() }}
      </div>
      <!-- ปุ่มควบคุมการเปลี่ยนหน้า -->
      <div class="flex items-center space-x-2">
        <!-- ไปหน้าแรก (แสดงเฉพาะบนจอใหญ่) -->
        <Button
          variant="outline"
          class="hidden w-8 h-8 p-0 lg:flex"
          :disabled="!props.table.getCanPreviousPage()"
          @click="props.table.setPageIndex(0)"
        >
          <span class="sr-only">Go to first page</span>
          <DoubleArrowLeftIcon class="w-4 h-4" />
        </Button>
        <!-- ไปหน้าก่อนหน้า -->
        <Button
          variant="outline"
          class="w-8 h-8 p-0"
          :disabled="!props.table.getCanPreviousPage()"
          @click="props.table.previousPage()"
        >
          <span class="sr-only">Go to previous page</span>
          <ChevronLeftIcon class="w-4 h-4" />
        </Button>
        <!-- ไปหน้าถัดไป -->
        <Button
          variant="outline"
          class="w-8 h-8 p-0"
          :disabled="!props.table.getCanNextPage()"
          @click="props.table.nextPage()"
        >
          <span class="sr-only">Go to next page</span>
          <ChevronRightIcon class="w-4 h-4" />
        </Button>
        <!-- ไปหน้าสุดท้าย (แสดงเฉพาะบนจอใหญ่) -->
        <Button
          variant="outline"
          class="hidden w-8 h-8 p-0 lg:flex"
          :disabled="!props.table.getCanNextPage()"
          @click="props.table.setPageIndex(props.table.getPageCount() - 1)"
        >
          <span class="sr-only">Go to last page</span>
          <DoubleArrowRightIcon class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
