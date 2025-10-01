<!-- ไฟล์: resources/js/components/custom/data-table/DataTable.vue -->
<script setup lang="ts" generic="TData">
import { computed, unref, type Ref, ref } from 'vue'
import type { 
  ColumnDef, 
  ExpandedState 
} from '@tanstack/vue-table'
import { 
  FlexRender, 
  getCoreRowModel, 
  getExpandedRowModel,
  useVueTable 
} from '@tanstack/vue-table'
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { valueUpdater } from '@/lib/utils'

// Props รวม loading state และ expanding options
interface Props {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  loading?: boolean | Ref<boolean>
  // เพิ่ม prop สำหรับกำหนดว่าต้องการแสดงข้อมูลอะไรใน expanded row
  expandedContent?: (row: TData) => string | object
}

// แก้ไข withDefaults เพื่อแก้ปัญหา TypeScript generic type
const props = defineProps<Props>()

// กำหนด default values แยกต่างหาก
const { 
  loading = false, 
  expandedContent = (row: TData) => JSON.stringify(row, null, 2) 
} = props

// State สำหรับจัดการการขยายแถว
const expanded = ref<ExpandedState>({})

// ใช้งาน useVueTable จาก tanstack-table พร้อม expanding feature
const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(), // เพิ่ม expanded row model
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded), // จัดการ state การขยาย
  state: {
    get expanded() { 
      return expanded.value 
    },
  },
})

const isLoading = computed(() => unref(loading) ?? false)
</script>

<template>
  <!-- โครงสร้างตาราง UI พร้อม expanding functionality -->
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
        
        <!-- ข้อมูลปกติพร้อมการขยายแถว -->
        <template v-else-if="table.getRowModel().rows?.length">
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <!-- แถวหลัก -->
            <TableRow :data-state="row.getIsSelected() ? 'selected' : undefined">
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
            
            <!-- แถวที่ขยายแล้ว - แสดงเมื่อ row.getIsExpanded() เป็น true -->
            <TableRow v-if="row.getIsExpanded()" class="bg-muted/50">
              <TableCell 
                :colspan="row.getAllCells().length" 
                class="p-4"
              >
                <!-- Custom content area สำหรับข้อมูลเพิ่มเติม -->
                <div class="rounded-md bg-background p-4 border">
                  <h4 class="text-sm font-medium mb-2 text-muted-foreground">
                    รายละเอียดเพิ่มเติม
                  </h4>
                  <!-- ใช้ expandedContent prop หรือ default JSON display -->
                  <pre class="text-xs text-muted-foreground whitespace-pre-wrap">{{ expandedContent(row.original) }}</pre>
                </div>
              </TableCell>
            </TableRow>
          </template>
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
