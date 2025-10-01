<!-- ไฟล์: resources/js/components/custom/data-table/DataTable.vue -->
<script setup lang="ts" generic="TData">
import { computed, unref, type Ref, ref } from 'vue'
import type { 
  ColumnDef, 
  ExpandedState,
  VisibilityState 
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
  // เพิ่ม prop สำหรับควบคุมการแสดง toolbar
  showToolbar?: boolean
  // เพิ่ม prop สำหรับชื่อตาราง
  title?: string
}

// แก้ไข withDefaults เพื่อแก้ปัญหา TypeScript generic type
const props = defineProps<Props>()

// กำหนด default values แยกต่างหาก
const { 
  loading = false, 
  expandedContent = (row: TData) => JSON.stringify(row, null, 2),
  showToolbar = false,
  title = 'ข้อมูล'
} = props

// State สำหรับจัดการการขยายแถว
const expanded = ref<ExpandedState>({})

// เพิ่ม State สำหรับจัดการการแสดง/ซ่อน columns
const columnVisibility = ref<VisibilityState>({})

// ใช้งาน useVueTable จาก tanstack-table พร้อม expanding และ column visibility features
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
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility), // จัดการ column visibility
  state: {
    get expanded() { 
      return expanded.value 
    },
    get columnVisibility() {
      return columnVisibility.value
    }
  },
})

const isLoading = computed(() => unref(loading) ?? false)

// Export table instance เพื่อให้ parent component สามารถเข้าถึงได้
defineExpose({ 
  table,
  expanded,
  columnVisibility 
})

// Log สำหรับ debugging
console.log('DataTable: Initialized with column visibility support', props.columns.length, 'columns')
</script>

<template>
  <!-- โครงสร้างตาราง UI พร้อม expanding และ column visibility functionality -->
  <div class="border rounded-md">
    <Table>
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          class="hover:bg-muted/50 transition-colors"
        >
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colspan="header.colSpan"
            class="font-medium"
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
            <TableRow 
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              class="hover:bg-muted/50 transition-colors"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" class="py-2">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
            
            <!-- แถวที่ขยายแล้ว - แสดงเมื่อ row.getIsExpanded() เป็น true -->
            <TableRow v-if="row.getIsExpanded()" class="bg-muted/30">
              <TableCell 
                :colspan="row.getAllCells().length" 
                class="p-4"
              >
                <!-- Custom content area สำหรับข้อมูลเพิ่มเติม -->
                <div class="rounded-md bg-background p-4 border shadow-sm">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-medium text-foreground">
                      รายละเอียดเพิ่มเติม
                    </h4>
                    <span class="text-xs text-muted-foreground">
                      ID: {{ row.id }}
                    </span>
                  </div>
                  
                  <!-- ใช้ expandedContent prop หรือ default JSON display -->
                  <div class="bg-muted/50 rounded-md p-3 max-h-64 overflow-auto">
                    <pre class="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{{ expandedContent(row.original) }}</pre>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </template>
        
        <!-- ไม่มีข้อมูล -->
        <template v-else>
          <TableRow>
            <TableCell :colspan="props.columns.length" class="h-32 text-center">
              <div class="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                <div class="text-4xl">📋</div>
                <p class="font-medium">ไม่มีข้อมูล</p>
                <p class="text-xs">ลองปรับการค้นหาหรือเพิ่มข้อมูลใหม่</p>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
