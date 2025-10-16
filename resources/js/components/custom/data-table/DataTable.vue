<!-- resourcesjscomponentscustomdata-tableDataTable.vue -->
<script setup lang="ts" generic="TData">
import { computed, unref, type Ref, ref, watch } from 'vue'
import type { ColumnDef, ExpandedState, VisibilityState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useVueTable,
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
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

// Props: loading state, expanding options
interface Props {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  loading?: boolean | Ref<boolean>
  // prop สำหรับ expanded row
  expandedContent?: (row: TData) => string | object
  // prop สำหรับ toolbar
  showToolbar?: boolean
  // prop สำหรับ title
  title?: string
}

// withDefaults สำหรับ TypeScript generic type
const props = defineProps<Props>()

// default values
const {
  loading = false,
  expandedContent = (row: TData) => JSON.stringify(row, null, 2),
  showToolbar = false,
  title,
} = props

// State สำหรับ expanded rows
const expanded = ref<ExpandedState>({})

// State สำหรับ columns visibility
const columnVisibility = ref<VisibilityState>({})

// useVueTable จาก tanstack-table พร้อม expanding และ column visibility features
const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(), // เพิ่ม expanding model
  // expanded row model
  onExpandedChange: (updaterOrValue) => {
    valueUpdater(updaterOrValue, expanded)
  },
  // state สำหรับ expanded
  state: {
    get expanded() {
      return expanded.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
  },
  // column visibility state
  onColumnVisibilityChange: (updaterOrValue) => {
    valueUpdater(updaterOrValue, columnVisibility)
  },
  // เพิ่ม manual expand
  enableExpanding: true,
  getRowCanExpand: () => true, // ทุก row สามารถ expand ได้
})

// ตรวจสอบ loading state
const isLoading = computed(() => unref(loading) ?? false)

// Export table instance ให้ parent component
defineExpose({
  table,
  expanded,
  columnVisibility,
})

// Log สำหรับ debugging
console.log('[DataTable] Initialized with column visibility and expand support', {
  columnsCount: props.columns.length,
  dataCount: props.data.length,
})

// Watch expanded state เพื่อ debug
watch(expanded, (newValue) => {
  console.log('[DataTable] Expanded state changed:', newValue)
}, { deep: true })
</script>

<template>
  <!-- UI พร้อม expanding และ column visibility functionality -->
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

        <!-- แสดงข้อมูล -->
        <template v-else-if="table.getRowModel().rows?.length">
          <template v-for="row in table.getRowModel().rows" :key="row.id">
            <!-- แถวหลัก -->
            <TableRow
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              class="hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="py-2"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>

            <!-- แถว expanded content - แสดงเมื่อ row.getIsExpanded() === true -->
            <TableRow v-if="row.getIsExpanded()" class="bg-muted/30">
              <TableCell :colspan="row.getAllCells().length" class="p-4">
                <!-- Custom content area -->
                <div class="rounded-md bg-background p-4 border shadow-sm">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="text-sm font-medium text-foreground">รายละเอียด</h4>
                    <span class="text-xs text-muted-foreground">ID: {{ row.id }}</span>
                  </div>

                  <!-- ใช้ expandedContent prop หรือ default เป็น JSON display -->
                  <div class="bg-muted/50 rounded-md p-3 max-h-64 overflow-auto">
                    <component
                      v-if="typeof expandedContent(row.original) === 'object'"
                      :is="expandedContent(row.original)"
                    />
                    <pre
                      v-else
                      class="text-xs text-muted-foreground whitespace-pre-wrap font-mono"
                    >{{ expandedContent(row.original) }}</pre>
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
                <p class="font-medium">ไม่พบข้อมูล</p>
                <p class="text-xs">ลองค้นหาด้วยคำค้นอื่นหรือเพิ่มข้อมูลใหม่</p>
              </div>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
