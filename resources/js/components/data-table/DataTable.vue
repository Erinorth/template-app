<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { safeGetIsGrouped, safeGetIsAggregated, safeGetSubRows } from '@/lib/table-utils'

// Props definition
interface Props {
  columns?: ColumnDef<TData, TValue>[]
  data?: TData[]
  table?: any
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => [],
  data: () => []
})

// ใช้ table จาก props หากมี หรือสร้างใหม่หากไม่มี
const tableInstance = props.table || useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
})

// ใช้ table ที่เหมาะสม
const table = props.table ? props.table : tableInstance
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow 
          v-for="headerGroup in table.getHeaderGroups()" 
          :key="headerGroup.id"
        >
          <TableHead 
            v-for="header in headerGroup.headers" 
            :key="header.id"
            :style="{
              width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined,
              position: 'relative'
            }"
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
        <template v-if="table.getRowModel().rows?.length">
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <!-- แถวหลัก -->
            <TableRow
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              :class="[
                'hover:bg-muted/50 transition-colors',
                safeGetIsGrouped(row) ? 'bg-muted/30 font-medium' : '',
                safeGetIsAggregated(row) ? 'bg-accent/20 font-medium' : ''
              ]"
            >
              <TableCell 
                v-for="cell in row.getVisibleCells()" 
                :key="cell.id"
                :style="{
                  width: cell.column.getSize() !== 150 ? `${cell.column.getSize()}px` : undefined
                }"
              >
                <FlexRender 
                  :render="cell.column.columnDef.cell" 
                  :props="cell.getContext()" 
                />
              </TableCell>
            </TableRow>
            
            <!-- แถวขยาย (หาก expanded) -->
            <TableRow 
              v-if="row.getIsExpanded && row.getIsExpanded()"
              class="bg-muted/10"
            >
              <TableCell 
                :colspan="row.getAllCells().length"
                class="p-4"
              >
                <div class="bg-card rounded-lg p-4 border">
                  <h4 class="font-medium text-sm mb-2 text-muted-foreground">
                    รายละเอียดเพิ่มเติม
                  </h4>
                  <pre class="text-xs bg-muted p-2 rounded overflow-auto">{{ JSON.stringify(row.original, null, 2) }}</pre>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </template>
        <template v-else>
          <TableRow>
            <TableCell 
              :colspan="props.columns?.length || table.getAllColumns().length" 
              class="h-24 text-center text-muted-foreground"
            >
              <div class="flex flex-col items-center justify-center gap-2">
                <div class="text-4xl">📋</div>
                <div>ไม่มีข้อมูล</div>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
