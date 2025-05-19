<!-- 
  ไฟล์: resources/js/components/ui/data-table/DataTableViewOptions.vue
  คอมโพเนนต์นี้ใช้สำหรับแสดงเมนู dropdown เพื่อเลือกแสดง/ซ่อนคอลัมน์ใน data-table
  ใช้ icon จาก lucide-vue-next เท่านั้น
  ออกแบบ UX/UI สำหรับ PC (ปุ่มซ่อนบน mobile)
-->

<script setup lang="ts">
// นำเข้า type Table จาก @tanstack/vue-table เพื่อควบคุม state ของตาราง
import type { Table } from '@tanstack/vue-table'
// นำเข้า computed สำหรับสร้าง list คอลัมน์แบบ reactive
import { computed } from 'vue'
// นำเข้า icon จาก lucide-vue-next
import { SlidersHorizontal as MixerHorizontalIcon } from 'lucide-vue-next'

// นำเข้า Button และ DropdownMenu ที่จำเป็นสำหรับ UI
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// รับ prop table (object จาก @tanstack/vue-table)
interface DataTableViewOptionsProps {
  table: Table<any>
}
const props = defineProps<DataTableViewOptionsProps>()

// สร้าง computed columns ที่สามารถซ่อน/แสดงได้
const columns = computed(() => 
  props.table.getAllColumns().filter(
    column =>
      typeof column.accessorFn !== 'undefined' && column.getCanHide(),
  )
)
</script>

<template>
  <!-- ปุ่มเปิดเมนู dropdown สำหรับเลือกคอลัมน์ที่จะแสดง/ซ่อน -->
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        class="hidden h-8 ml-auto lg:flex"
      >
        <MixerHorizontalIcon class="w-4 h-4 mr-2" />
        View
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[150px]">
      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <!-- สร้าง checkbox สำหรับแต่ละคอลัมน์ที่สามารถซ่อน/แสดงได้ -->
      <DropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        class="capitalize"
        :modelValue="column.getIsVisible()"
        @update:modelValue="(value) => column.toggleVisibility(!!value)"
      >
        {{ column.id }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
