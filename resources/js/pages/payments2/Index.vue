<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Payment } from '@/types/payment'
import type { BreadcrumbItem } from '@/types'
import { useDataTable } from '@/composables/useDataTable'
import { createPaymentColumns } from '@/components/data-table/payment-columns'
import { toast } from 'vue-sonner'

// Layout และ Navigation imports
import AppLayout from '@/layouts/AppLayout.vue'
import { Head } from '@inertiajs/vue3'

// Components
import DataTable from '@/components/data-table/DataTable.vue'
import DataTableFilters from '@/components/data-table/DataTableFilters.vue'
import DataTablePagination from '@/components/data-table/DataTablePagination.vue'

// การกำหนด Props สำหรับรับข้อมูลจาก Laravel Controller
const props = defineProps<{
  payments: Payment[]
}>()

// การกำหนด Breadcrumbs
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

// การจัดการข้อมูลและ state
const data = ref<Payment[]>(props.payments)

// สร้าง columns และ table instance
const columns = createPaymentColumns()
const {
  table,
  clearAllFilters,
  activeFiltersCount,
  activeGroupingCount,
  grouping
} = useDataTable({
  columns,
  data: data.value,
  enableSorting: true,
  enableFiltering: true,
  enableGrouping: true,
  enableColumnResizing: true
})

// โหลดข้อมูลเมื่อ component ถูกสร้าง
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

// Watch props changes และอัพเดทข้อมูลเมื่อ props เปลี่ยน
watch(() => props.payments, (newPayments) => {
  data.value = newPayments
  console.log('Data updated from props:', newPayments.length, 'items')
  toast.info(`อัพเดทข้อมูล: ${newPayments.length} รายการ`)
}, { immediate: true })
</script>

<template>
  <Head title="การชำระเงิน" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- Header Section -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">การชำระเงิน</h1>
          <p class="text-muted-foreground">จัดการและติดตามการชำระเงินทั้งหมด</p>
        </div>
      </div>

      <!-- Filters Section -->
      <DataTableFilters 
        :table="table"
        :active-filters-count="activeFiltersCount"
        :active-grouping-count="activeGroupingCount"
        :grouping="grouping"
        @clear-filters="clearAllFilters"
      />

      <!-- Data Table -->
      <DataTable :table="table" />

      <!-- Pagination -->
      <DataTablePagination :table="table" />
    </div>
  </AppLayout>
</template>
