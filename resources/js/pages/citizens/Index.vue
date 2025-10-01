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
// ใช้ composables ที่จำเป็น
import { useColumnBuilder } from '@/composables/useColumnBuilder'
import { useServerOperations } from '@/composables/useServerOperations'
import { computed, ref, h } from 'vue'
import { router } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'

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

// Search state
const search = ref(props.query?.search ?? '')

// ใช้ column builder composable
const { 
  createExpandColumn,
  createIdColumn,
  createTextColumn, 
  createDateColumn,
  createActionColumn 
} = useColumnBuilder<Citizen>()

// Server operations
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

// === Citizen Actions (inline functions) ===

/**
 * ฟังก์ชันดูข้อมูลประชาชน
 */
function handleViewCitizen(citizen: Citizen) {
  console.log('View citizen:', citizen)
  router.get(route('citizens.show', citizen.id))
}

/**
 * ฟังก์ชันแก้ไขข้อมูลประชาชน
 */
function handleEditCitizen(citizen: Citizen) {
  console.log('Edit citizen:', citizen)
  router.get(route('citizens.edit', citizen.id))
}

/**
 * ฟังก์ชันลบข้อมูลประชาชน
 */
function handleDeleteCitizen(citizen: Citizen) {
  console.log('Delete citizen:', citizen)
  
  if (confirm(`คุณต้องการลบข้อมูลประชาชน ${citizen.citizen_id} หรือไม่?`)) {
    router.delete(route('citizens.destroy', citizen.id), {
      onSuccess: () => {
        toast.success('ลบข้อมูลเรียบร้อยแล้ว')
      },
      onError: () => {
        toast.error('เกิดข้อผิดพลาดในการลบข้อมูล')
      }
    })
  }
}

/**
 * ฟังก์ชันจัดการ custom actions
 */
function handleCustomAction(actionKey: string, citizen: Citizen) {
  console.log('Custom action:', actionKey, citizen)
  
  switch (actionKey) {
    case 'print':
      // Logic สำหรับพิมพ์
      toast.info(`พิมพ์ข้อมูล ${citizen.citizen_id}`)
      break
    case 'export':
      // Logic สำหรับส่งออก
      toast.info(`ส่งออกข้อมูล ${citizen.citizen_id}`)
      break
    case 'generateCard':
      // Logic เฉพาะการสร้างบัตรประชาชน
      toast.info(`สร้างบัตรสำหรับ ${citizen.citizen_id}`)
      // router.post(route('citizen-cards.generate', citizen.id))
      break
    case 'viewHistory':
      // Logic เฉพาะการดูประวัติ
      toast.info(`ดูประวัติของ ${citizen.citizen_id}`)
      // router.get(route('citizens.history', citizen.id))
      break
    default:
      console.warn('Unknown action:', actionKey)
  }
}

/**
 * ฟังก์ชันสร้างเนื้อหาสำหรับ expanded row
 */
function createExpandedContent(citizen: Citizen): string {
  return `รหัสประชาชน: ${citizen.citizen_id}
วันเกิด: ${citizen.birth_date}
หมายเหตุ: ${citizen.remark || 'ไม่มี'}
สร้างเมื่อ: ${citizen.created_at}
อัปเดตเมื่อ: ${citizen.updated_at || 'ไม่มี'}
รหัสระบบ: ${citizen.id}`
}

// === Search Handler ===

/**
 * ฟังก์ชัน handle search
 */
function handleSearch(searchValue: string) {
  search.value = searchValue
  
  serverOps.makeRequest({
    search: searchValue,
    sort: props.sort,
    direction: props.direction,
    per_page: props.citizens.per_page,
    page: 1 // reset เป็นหน้า 1 เมื่อ search
  })
}

// === Columns Definition ===

const columns = computed(() => [
  // Column ที่ 1: Expand Button
  createExpandColumn(),
  
  // Column ที่ 2: ID Column
  createIdColumn('id', 'ID', { 
    sortable: true, 
    onSort: serverOps.onSort 
  }),
  
  // Column ที่ 3: Citizen ID
  createTextColumn('citizen_id', 'เลขประจำตัวประชาชน', {
    sortable: true,
    className: 'font-mono break-all',
    onSort: serverOps.onSort
  }),
  
  // Column ที่ 4: Birth date
  createDateColumn('birth_date', 'วันเกิด', {
    sortable: true,
    includeTime: false,
    onSort: serverOps.onSort
  }),
  
  // Column ที่ 5: Remark
  createTextColumn('remark', 'หมายเหตุ', {
    sortable: true,
    maxLength: 50,
    onSort: serverOps.onSort
  }),
  
  // Column ที่ 6: Created at
  createDateColumn('created_at', 'สร้างเมื่อ', {
    sortable: true,
    includeTime: true,
    className: 'text-gray-600',
    onSort: serverOps.onSort
  }),

  // Column สุดท้าย: Actions
  createActionColumn((citizen: Citizen) => 
    h(DataTableDropdown, {
      item: citizen,
      idKey: 'id',
      nameKey: 'citizen_id',
      enableCopy: true,
      enableView: true,
      enableEdit: true,
      enableDelete: true,
      actions: [
        {
          key: 'generateCard',
          label: 'สร้างบัตร',
          separator: true
        },
        {
          key: 'viewHistory',
          label: 'ดูประวัติ'
        },
        {
          key: 'print',
          label: 'พิมพ์',
          separator: true
        },
        {
          key: 'export',
          label: 'ส่งออก Excel'
        }
      ],
      // Event handlers
      onView: (item: any) => handleViewCitizen(item as Citizen),
      onEdit: (item: any) => handleEditCitizen(item as Citizen),
      onDelete: (item: any) => handleDeleteCitizen(item as Citizen),
      onAction: (actionKey: string, item: any) => handleCustomAction(actionKey, item as Citizen)
    })
  )
])
</script>

<template>
  <Head :title="props.title ?? 'Citizens'" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- Header Section -->
      <HeaderWithTitle
        :title="props.title ?? 'Citizens'"
        subtitle="ข้อมูลประชาชนในระบบ"
        description="ตารางโหมดง่าย + แบ่งหน้าฝั่งเซิร์ฟเวอร์ พร้อม debounced search และ expanding rows"
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
      
      <!-- Data Table พร้อม Expanding -->
      <DataTable 
        :columns="columns" 
        :data="props.citizens.data"
        :loading="serverOps.isLoading"
        :expanded-content="createExpandedContent"
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
