<script setup lang="ts">
// Component สำหรับจัดการ columns ที่แสดงใน data table
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

// Props interface สำหรับรับ table instance
interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

// Generic props definition
const props = defineProps<DataTableViewOptionsProps<any>>()

// ฟิลเตอร์ columns ที่สามารถซ่อนได้และมี accessor function
const columns = computed(() =>
  props.table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
)

// ฟังก์ชันสำหรับดึงชื่อ column ที่แสดงจริงในหัวตาราง
const getColumnDisplayName = (column: any): string => {
  // 1. ตรวจสอบ meta.displayName ก่อน (จากการปรับปรุง useColumnBuilder)
  if (column.columnDef.meta?.displayName) {
    return column.columnDef.meta.displayName
  }
  
  // 2. ถ้า header เป็น string ให้ใช้โดยตรง
  if (typeof column.columnDef.header === 'string') {
    return column.columnDef.header
  }
  
  // 3. ถ้า header เป็น Vue component (จาก createSortableHeader)
  if (column.columnDef.header && typeof column.columnDef.header === 'object') {
    // ดึงจาก children array หรือ props
    if (column.columnDef.header.children && Array.isArray(column.columnDef.header.children)) {
      // หา text node ใน children
      const textChild = column.columnDef.header.children.find((child: any) => 
        typeof child === 'string' || (child && typeof child === 'object' && child.children)
      )
      if (typeof textChild === 'string') {
        return textChild
      }
      if (textChild && typeof textChild === 'object' && textChild.children) {
        return textChild.children
      }
    }
    
    // ถ้ามี displayName property
    if ((column.columnDef.header as any).displayName) {
      return (column.columnDef.header as any).displayName
    }
  }
  
  // 4. ถ้า header เป็น function ให้พยายามเรียกใช้
  if (typeof column.columnDef.header === 'function') {
    try {
      const result = column.columnDef.header()
      if (typeof result === 'string') {
        return result
      }
      // ถ้าเป็น Vue component ให้พยายามดึง text
      if (result && typeof result === 'object' && result.children) {
        if (typeof result.children === 'string') {
          return result.children
        }
        if (Array.isArray(result.children)) {
          const textChild = result.children.find((child: any) => typeof child === 'string')
          if (textChild) return textChild
        }
      }
    } catch (error) {
      console.warn('Error executing header function for column:', column.id, error)
    }
  }
  
  // 5. Fallback: แปลง column.id ให้เป็นรูปแบบที่อ่านได้
  return column.id
    .replace(/([A-Z])/g, ' $1') // เพิ่มช่องว่างก่อนตัวพิมพ์ใหญ่
    .replace(/[._]/g, ' ') // แทนที่ underscore และ dot ด้วยช่องว่าง
    .split(' ')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

// Log สำหรับการตรวจสอบ
console.log('DataTableViewOptions: Column analysis', columns.value.map(col => ({
  id: col.id,
  headerType: typeof col.columnDef.header,
  header: col.columnDef.header,
  meta: col.columnDef.meta,
  displayName: getColumnDisplayName(col)
})))
</script>

<template>
  <!-- Dropdown menu สำหรับ column visibility -->
  <DropdownMenu>
    <!-- Trigger button - ซ่อนบน screen เล็กและแสดงบน lg ขึ้นไป -->
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        class="hidden h-8 ml-auto lg:flex hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <!-- Settings2 icon จาก lucide-vue-next -->
        <Settings2 class="w-4 h-4 mr-2" />
        <span class="hidden sm:inline">แสดง/ซ่อนคอลัมน์</span>
        <span class="sm:hidden">View</span>
      </Button>
    </DropdownMenuTrigger>

    <!-- Dropdown content -->
    <DropdownMenuContent align="end" class="w-[200px] max-h-[300px] overflow-y-auto">
      <!-- Header -->
      <DropdownMenuLabel class="text-sm font-medium">
        แสดง/ซ่อนคอลัมน์
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <!-- Checkbox items สำหรับแต่ละ column -->
      <DropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        :model-value="column.getIsVisible()"
        @update:model-value="(value) => {
          // Toggle column visibility
          column.toggleVisibility(!!value)
          // Log สำหรับการตรวจสอบ
          console.log('Column', column.id, 'visibility changed to:', !!value, 'Display name:', getColumnDisplayName(column))
        }"
      >
        <!-- แสดงชื่อ column ตามที่กำหนดไว้ -->
        <span class="truncate text-sm">
          {{ getColumnDisplayName(column) }}
        </span>
      </DropdownMenuCheckboxItem>

      <!-- ข้อความเมื่อไม่มี columns -->
      <div v-if="columns.length === 0" class="px-3 py-2 text-sm text-muted-foreground text-center">
        ไม่มีคอลัมน์ที่สามารถซ่อนได้
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
