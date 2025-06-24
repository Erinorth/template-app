<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Head, router } from '@inertiajs/vue3' // เพิ่ม router import
import { toast } from 'vue-sonner'

// Layout และ Navigation imports
import AppLayout from '@/layouts/AppLayout.vue'
import Title from '@/components/Title.vue'
import type { BreadcrumbItem } from '@/types'

// Data Table imports
import { useDataTable } from '@/composables/useDataTable'
import { createPaymentColumns } from '@/pages/payments2/data-table/payment-columns'
import DataTable from '@/pages/payments2/data-table/DataTable.vue'
import DataTablePagination from '@/components/data-table/DataTablePagination.vue'

// Filter Components
import StatusFilter from '@/components/data-table/StatusFilter.vue'
import AmountRangeFilter from '@/components/data-table/AmountRangeFilter.vue'
import EmailFilter from '@/components/data-table/EmailFilter.vue'

// UI Components imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'

// Icons
import { 
  Settings2, 
  Plus, 
  Group, 
  Ungroup,
  Filter
} from 'lucide-vue-next'

// Types
import type { Payment } from '@/types/payment'

// Props จาก Laravel Controller
const props = defineProps<{
  payments: Payment[]
}>()

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Payments',
    href: '/payments',
  },
]

// ข้อมูลและการตั้งค่าตาราง
const data = ref<Payment[]>(props.payments)
const columns = createPaymentColumns()

// ใช้ useDataTable composable
const {
  table,
  sorting,
  columnFilters,
  columnVisibility,
  rowSelection,
  expanded,
  columnSizing,
  grouping,
  clearAllFilters,
  activeFiltersCount,
  activeGroupingCount
} = useDataTable({
  data: data.value,
  columns,
  enableFiltering: true,
  enableGrouping: true,
  enableColumnResizing: true
})

// Column Visibility Controls
const DataTableViewOptions = computed(() => {
  const columns = table.getAllColumns()
    .filter((column: any) => 
      typeof column.accessorFn !== 'undefined' && column.getCanHide()
    )
  return columns
})

// Grouping Controls Functions
const quickGroupByStatus = () => {
  try {
    table.setGrouping(['status'])
    toast.success('จัดกลุ่มตามสถานะ')
  } catch (error) {
    console.warn('Group by status failed:', error)
  }
}

const quickGroupByEmail = () => {
  try {
    table.setGrouping(['email'])
    toast.success('จัดกลุ่มตามอีเมล')
  } catch (error) {
    console.warn('Group by email failed:', error)
  }
}

const clearAllGrouping = () => {
  try {
    table.resetGrouping()
    toast.info('ยกเลิกการจัดกลุ่มทั้งหมด')
  } catch (error) {
    console.warn('Clear grouping failed:', error)
  }
}

// Watch props changes
watch(() => props.payments, (newPayments) => {
  data.value = newPayments
  console.log('Data updated from props:', newPayments.length, 'items')
  toast.info(`อัพเดทข้อมูล: ${newPayments.length} รายการ`)
}, { immediate: true })

// Mount lifecycle
onMounted(() => {
  try {
    console.log('Data loaded from props:', data.value)
    console.log('Data length:', data.value.length)
    toast.success(`โหลดข้อมูลแล้ว: ${data.value.length} รายการ`)
  } catch (error) {
    console.error('Failed to process data:', error)
    toast.error('ไม่สามารถประมวลผลข้อมูลได้')
  }
})

// แก้ไขฟังก์ชัน addNewPayment ให้ใช้ router
const addNewPayment = () => {
  router.visit('/payments2/create')
}
</script>

<template>
  <Head title="การชำระเงิน" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <Title 
          title="จัดการการชำระเงิน"
          subtitle="ระบบจัดการข้อมูลการชำระเงินทั้งหมด"
          description="ดู แก้ไข และจัดการข้อมูลการชำระเงินของลูกค้าทั้งหมดในระบบ"
          badge-variant="secondary"
          size="lg"
        />
        
        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <Button @click="addNewPayment">
            <Plus class="w-4 h-4 mr-2" />
            เพิ่มการชำระเงิน
          </Button>
        </div>
      </div>
      
      <!-- Enhanced Controls Section พร้อม Multiple Filters และ Grouping -->
      <div class="flex flex-col gap-4">
        <!-- แถวตัวกรองหลัก -->
        <div class="flex items-center gap-4 flex-wrap">
          <!-- Enhanced Email Filter พร้อม Autocomplete -->
          <EmailFilter 
            v-if="table.getColumn('email')"
            :column="table.getColumn('email')!" 
          />
          
          <!-- ID Filter -->
          <Input 
            class="max-w-sm" 
            placeholder="กรองตาม ID..."
            :model-value="table.getColumn('id')?.getFilterValue() as string"
            @update:model-value="table.getColumn('id')?.setFilterValue($event)" 
          />
          
          <!-- Enhanced Column Visibility Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm" class="hidden h-8 ml-auto lg:flex">
                <Settings2 class="w-4 h-4 mr-2" />
                มุมมอง
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-[200px]">
              <DropdownMenuLabel>แสดง/ซ่อนคอลัมน์</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                v-for="column in DataTableViewOptions"
                :key="column.id"
                class="capitalize"
                :checked="column.getIsVisible()"
                @update:checked="column.toggleVisibility"
              >
                {{ column.id }}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>การกระทำคอลัมน์</DropdownMenuLabel>
              <DropdownMenuItem @click="table.resetColumnSizing()">
                รีเซ็ตขนาดคอลัมน์
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- แถวตัวกรองขั้นสูงและการจัดกลุ่ม -->
        <div class="flex items-center gap-4 flex-wrap">
          <!-- ใช้ StatusFilter component ที่ import มา -->
          <StatusFilter 
            v-if="table.getColumn('status')"
            :column="table.getColumn('status')!" 
          />
          
          <!-- Enhanced Amount Range Filter พร้อม Faceted Min/Max -->
          <AmountRangeFilter 
            v-if="table.getColumn('amount')"
            :column="table.getColumn('amount')!" 
          />
          
          <!-- Grouping Controls -->
          <div class="flex items-center gap-2">
            <!-- Quick grouping buttons -->
            <Button
              :variant="grouping.includes('status') ? 'default' : 'outline'"
              size="sm"
              @click="quickGroupByStatus"
              class="h-8"
            >
              <Group class="w-4 h-4 mr-2" />
              จัดกลุ่มตามสถานะ
            </Button>

            <Button
              :variant="grouping.includes('email') ? 'default' : 'outline'"
              size="sm"
              @click="quickGroupByEmail"
              class="h-8"
            >
              <Group class="w-4 h-4 mr-2" />
              จัดกลุ่มตามอีเมล
            </Button>

            <!-- Clear all button -->
            <Button
              v-if="activeGroupingCount > 0"
              variant="ghost"
              size="sm"
              @click="clearAllGrouping"
              class="h-8"
            >
              <Ungroup class="w-4 h-4 mr-2" />
              ยกเลิกทั้งหมด
            </Button>
          </div>
          
          <!-- ล้างตัวกรองทั้งหมด -->
          <Button
            v-if="activeFiltersCount > 0"
            variant="ghost"
            size="sm"
            @click="clearAllFilters"
            class="h-8"
          >
            ล้างตัวกรอง
            <Badge variant="secondary" class="ml-2 rounded-sm px-1 font-normal">
              {{ activeFiltersCount }}
            </Badge>
          </Button>
        </div>

        <!-- สรุปตัวกรองและการจัดกลุ่มที่ใช้งานอยู่ -->
        <div 
          v-if="activeFiltersCount > 0 || activeGroupingCount > 0" 
          class="flex items-center gap-4 text-sm text-muted-foreground"
        >
          <div v-if="activeFiltersCount > 0" class="flex items-center gap-2">
            <Filter class="w-4 h-4" />
            <span>ใช้ตัวกرอง {{ activeFiltersCount }} ตัว</span>
          </div>
          
          <div v-if="activeGroupingCount > 0" class="flex items-center gap-2">
            <Group class="w-4 h-4" />
            <span>จัดกลุ่มโดย {{ grouping.join(', ') }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <span>•</span>
            <span>แสดง {{ table.getFilteredRowModel().rows.length }} จาก {{ data.length }} แถว</span>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <DataTable :table="table" />

      <!-- Enhanced Pagination Section -->
      <DataTablePagination :table="table" />
    </div>
  </AppLayout>
</template>
