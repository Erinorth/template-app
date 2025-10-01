<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { type BreadcrumbItem } from '@/types'
import { Head, Link } from '@inertiajs/vue3'
import { HeaderWithTitle } from '@/components/custom/header-with-title'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/custom/data-table/DataTable.vue'
import DataTablePagination from '@/components/custom/data-table/DataTablePagination.vue'
import DataTableSearch from '@/components/custom/data-table/DataTableSearch.vue'
import DataTableDropdown from '@/components/custom/data-table/DataTableDropdown.vue'
import type { Citizen } from '@/types/citizen'
import type { LengthAwarePaginator } from '@/types/pagination'
// ใช้ composables ที่ปรับปรุงแล้ว
import { useColumnBuilder } from '@/composables/useColumnBuilder'
import { useServerOperations } from '@/composables/useServerOperations'
import { computed, ref, h } from 'vue'
import { router } from '@inertiajs/vue3'

// Props definition
const props = defineProps<{
  title: string
  citizens: LengthAwarePaginator<Citizen>
  sort: string
  direction: string
  query?: Record<string, any>
}>()

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Citizens', href: '/citizens' },
]

// Search state - เก็บค่าปัจจุบัน
const search = ref(props.query?.search ?? '')

// สร้าง server operations instance รวมทั้ง pagination และ sorting
const serverOps = useServerOperations({
  routeName: 'citizens.index',
  currentPage: computed(() => props.citizens.current_page),
  totalPages: computed(() => props.citizens.last_page),
  perPage: computed(() => props.citizens.per_page),
  sort: computed(() => props.sort),
  direction: computed(() => props.direction as 'asc' | 'desc'),
  extra: computed(() => ({ 
    search: search.value,
    ...props.query 
  }))
})

// สร้าง columns โดยใช้ generic column builder
const { createIdColumn, createTextColumn, createDateColumn } = useColumnBuilder<Citizen>()

const columns = computed(() => [
  // สร้าง ID column
  createIdColumn('id', 'ID', { 
    sortable: true, 
    onSort: serverOps.onSort 
  }),
  
  // สร้าง citizen ID column
  createTextColumn('citizen_id', 'เลขประจำตัวประชาชน', {
    sortable: true,
    className: 'font-mono break-all',
    onSort: serverOps.onSort
  }),
  
  // สร้าง birth date column
  createDateColumn('birth_date', 'วันเกิด', {
    sortable: true,
    includeTime: false,
    onSort: serverOps.onSort
  }),
  
  // สร้าง remark column
  createTextColumn('remark', 'หมายเหตุ', {
    sortable: true,
    maxLength: 50, // จำกัดความยาวที่แสดง
    onSort: serverOps.onSort
  }),
  
  // สร้าง created_at column
  createDateColumn('created_at', 'สร้างเมื่อ', {
    sortable: true,
    includeTime: true,
    className: 'text-gray-600',
    onSort: serverOps.onSort
  }),

  /* ---------- คอลัมน์เมนูการทำงาน ---------- */
  {
    id: 'actions',
    header: 'จัดการ',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const citizen = row.original as Citizen
      return h(DataTableDropdown, {
        item: citizen,            // ระบุตัว record
        idKey: 'id',
        nameKey: 'citizen_id',
        enableCopy: true,
        enableView: true,
        enableEdit: true,
        enableDelete: true,
        actions: [
          { key: 'print', label: 'พิมพ์' },
          { key: 'export', label: 'ส่งออก', separator: true }
        ],
        // event emitters
        onView: (item: Citizen) => router.get(route('citizens.show', item.id)),
        onEdit: (item: Citizen) => router.get(route('citizens.edit', item.id)),
        onDelete: (item: Citizen) => router.delete(route('citizens.destroy', item.id)),
        onAction: (key: string, item: Citizen) => {
          if (key === 'print') {
            router.get(route('citizens.print', item.id))
          }
          if (key === 'export') {
            router.get(route('citizens.export', item.id))
          }
        }
      })
    }
  }
])

// ฟังก์ชัน handle search จาก DataTableSearch
function handleSearch(searchValue: string) {
  search.value = searchValue
  
  // ใช้ makeRequest จาก useServerOperations
  serverOps.makeRequest({
    search: searchValue,
    sort: props.sort,
    direction: props.direction,
    per_page: props.citizens.per_page,
    page: 1 // reset เป็นหน้า 1 เมื่อ search
  })
}

// Alternative approach: ใช้ router โดยตรง (ถ้าต้องการความเรียบง่าย)
function handleSearchDirect(searchValue: string) {
  router.get(route('citizens.index'), { 
    search: searchValue,
    sort: props.sort,
    direction: props.direction,
    per_page: props.citizens.per_page,
    page: 1,
  }, {
    preserveState: true,
    replace: true,
    preserveScroll: true,
  })
}
</script>

<template>
  <Head :title="props.title ?? 'Citizens'" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- Header Section -->
      <HeaderWithTitle
        :title="props.title ?? 'Citizens'"
        subtitle="ข้อมูลประชาชนในระบบ"
        description="ตารางโหมดง่าย + แบ่งหน้าฝั่งเซิร์ฟเวอร์ พร้อม debounced search"
        badge="รายการ"
        badge-variant="secondary"
        size="lg"
        align="left"
        with-gradient
      >
        <template #actions>
          <Button as-child>
            <Link :href="route('citizens.create')">เพิ่มข้อมูล</Link>
          </Button>
        </template>
      </HeaderWithTitle>
      
      <!-- Search Section -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <DataTableSearch
          v-model="search"
          :columns="['citizen_id','remark','birth_date','id']"
          :debounce-delay="400"
          placeholder="ค้นหาข้อมูลประชาชน..."
          @search="handleSearch"
        />
        <div class="flex-1"></div>
      </div>
      
      <!-- Data Table -->
      <DataTable 
        :columns="columns" 
        :data="props.citizens.data"
        :loading="serverOps.isLoading"
      />
      
      <!-- Pagination -->
      <DataTablePagination
        :total="props.citizens.total"
        :current-page="props.citizens.current_page"
        :total-pages="props.citizens.last_page"
        :page-size="props.citizens.per_page"
        :from="props.citizens.from"
        :to="props.citizens.to"
        :links="props.citizens.links"
        :page-size-options="[10,20,50,100]"
        @change:page="serverOps.goPage"
        @change:pageSize="serverOps.changePageSize"
      />
    </div>
  </AppLayout>
</template>

<!--
การปรับปรุงสำคัญ:
✅ รวม useServerSort และ useServerPagination เป็น useServerOperations
✅ ใช้ useColumnBuilder แทน useCitizenColumns เพื่อความยืดหยุ่น
✅ เพิ่ม loading state จาก useServerOperations
✅ ลดความซ้ำซ้อนของโค้ด
✅ การจัดการ error ที่ดีขึ้นผ่าน useServerOperations
✅ โครงสร้างโค้ดที่เป็นระเบียบและง่ายต่อการบำรุงรักษา
✅ รองรับ Responsive Design ตามข้อกำหนด
-->
