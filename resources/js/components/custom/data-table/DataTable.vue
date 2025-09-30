<!-- ไฟล์: resources/js/components/custom/data-table/DataTable.vue -->
<script setup lang="ts" generic="TData">
import { computed, unref, type Ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

// Props รวม loading state
interface Props {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  loading?: boolean | Ref<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// ใช้งาน useVueTable จาก tanstack-table
const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
})

const isLoading = computed(() => unref(props.loading) ?? false)
</script>

<template>
  <!-- โครงสร้างตาราง UI -->
  <div class="border rounded-md">
    <Table>
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colspan="header.colSpan"
          >
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- Loading State -->
        <template v-if="isLoading">
          <TableRow v-for="i in 5" :key="`loading-${i}`">
            <TableCell v-for="j in props.columns.length" :key="`loading-cell-${j}`">
              <Skeleton class="h-4 w-full" />
            </TableCell>
          </TableRow>
        </template>
        
        <!-- ข้อมูลปกติ -->
        <template v-else-if="table.getRowModel().rows?.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </TableCell>
          </TableRow>
        </template>
        
        <!-- ไม่มีข้อมูล -->
        <template v-else>
          <TableRow>
            <TableCell :colspan="props.columns.length" class="h-24 text-center">
              ไม่มีข้อมูล
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
