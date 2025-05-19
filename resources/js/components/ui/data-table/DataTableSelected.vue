<!-- 
  ไฟล์: resources/js/components/ui/data-table/DataTableSelected.vue
  คอมโพเนนต์นี้แสดงจำนวนแถวที่ถูกเลือกเทียบกับจำนวนแถวทั้งหมดหลังกรอง
  ใช้ร่วมกับ data-table (ต้องส่ง prop table)
-->

<script setup lang="ts">
// นำเข้า type Table จาก @tanstack/vue-table
import type { Table } from '@tanstack/vue-table'

// รับ prop table (object จาก @tanstack/vue-table)
defineProps<{
  table: Table<any>
}>()
</script>

<template>
  <div class="flex-1 text-sm text-muted-foreground">
    {{ table.getFilteredSelectedRowModel().rows.length }} of
    {{ table.getFilteredRowModel().rows.length }} row(s) selected.
  </div>
</template>
