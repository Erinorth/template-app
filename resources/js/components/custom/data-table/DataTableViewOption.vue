<script setup lang="ts">
// components/DataTable/DataTableViewOptions.vue
// Component สำหรับจัดการการแสดง/ซ่อน columns ใน data table

import type { Table } from '@tanstack/vue-table'
import { computed } from 'vue'
import { Settings2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Props interface สำหรับรับ table instance แบบ generic
interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

// Generic props definition เพื่อรองรับข้อมูลทุกประเภท
const props = defineProps<DataTableViewOptionsProps<any>>()

// คำนวณ columns ที่สามารถซ่อนได้
// กรองเฉพาะ columns ที่มี accessor function และสามารถซ่อนได้
const columns = computed(() => 
  props.table.getAllColumns()
    .filter(column => 
      typeof column.accessorFn !== 'undefined' && column.getCanHide()
    )
)

// Log สำหรับ debugging
console.log('DataTableViewOptions: Available hideable columns', columns.value.map(col => col.id))
</script>

<template>
  <!-- Dropdown menu สำหรับการจัดการ column visibility -->
  <DropdownMenu>
    <!-- Trigger button - ซ่อนในหน้าจอเล็กกว่า lg -->
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        class="hidden h-8 ml-auto lg:flex hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <!-- ใช้ Settings2 icon จาก lucide-vue-next -->
        <Settings2 class="w-4 h-4 mr-2" />
        <span class="hidden sm:inline">มุมมอง</span>
        <span class="sm:hidden">View</span>
      </Button>
    </DropdownMenuTrigger>
    
    <!-- Dropdown content -->
    <DropdownMenuContent 
      align="end" 
      class="w-[180px] max-h-[300px] overflow-y-auto"
    >
      <!-- Header -->
      <DropdownMenuLabel class="text-sm font-medium">
        เลือกคอลัมน์ที่ต้องการแสดง
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <!-- Checkbox items สำหรับแต่ละ column -->
      <DropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        class="capitalize"
        :modelValue="column.getIsVisible()"
        @update:modelValue="(value) => {
          // Toggle column visibility
          column.toggleVisibility(!!value)
          // Log สำหรับ debugging
          console.log(`Column ${column.id} visibility changed to:`, !!value)
        }"
      >
        <!-- แสดงชื่อ column แบบ capitalize -->
        <span class="truncate">
          {{ column.id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) }}
        </span>
      </DropdownMenuCheckboxItem>

      <!-- แสดงข้อความเมื่อไม่มี columns ที่สามารถซ่อนได้ -->
      <div 
        v-if="columns.length === 0"
        class="px-3 py-2 text-sm text-muted-foreground text-center"
      >
        ไม่มีคอลัมน์ที่สามารถจัดการได้
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
