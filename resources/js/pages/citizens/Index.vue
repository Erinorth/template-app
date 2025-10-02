<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { type BreadcrumbItem } from '@/types'
import { Head, Link } from '@inertiajs/vue3'
import { HeaderWithTitle } from '@/components/custom/header-with-title'
import { Button } from '@/components/ui/button'
import { DataTable, DataTablePagination, DataTableSearch, DataTableViewOption } from '@/components/custom/data-table'
import type { Citizen } from './types'
import type { LengthAwarePaginator } from '@/types/pagination'
import { useCitizens } from './useCitizens'
import { useCitizenColumns } from './columns'
import { useServerOperations } from '@/composables/useServerOperations'
import { computed, ref } from 'vue'

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

// เพิ่ม ref สำหรับ DataTable component
const dataTableRef = ref()

// ใช้ Citizens composable
const {
  viewCitizen,
  editCitizen,
  deleteCitizen,
  handleCustomAction,
  createExpandedContent
} = useCitizens()

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

// Columns definition
const columns = useCitizenColumns(
  serverOps.onSort,
  viewCitizen,
  editCitizen,
  deleteCitizen,
  handleCustomAction
)

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

// Log สำหรับ debugging
console.log('Citizens page: Table initialized with', props.citizens.data.length, 'records')
console.log('Citizens page: Available columns', columns.value.map(col => col.id || 'unnamed'))
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
      
      <!-- Enhanced Toolbar Section -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-4 bg-card rounded-lg border">
        <!-- Search Section -->
        <div class="flex-1">
          <DataTableSearch
            v-model="search"
            :columns="['citizen_id','remark','birth_date','id']"
            :debounce-delay="400"
            placeholder="ค้นหาข้อมูลประชาชน..."
            @search="handleSearch"
          />
        </div>
        
        <!-- Toolbar Actions -->
        <div class="flex items-center space-x-2">
          <!-- Summary Info -->
          <div class="hidden md:flex items-center text-sm text-muted-foreground mr-4">
            <span>แสดง {{ props.citizens.from }}-{{ props.citizens.to }} จาก {{ props.citizens.total }} รายการ</span>
          </div>
          
          <!-- Column Visibility Control -->
          <DataTableViewOption 
            v-if="dataTableRef?.table"
            :table="dataTableRef.table" 
          />
        </div>
      </div>
      
      <!-- Data Table พร้อม Expanding และ Column Visibility -->
      <DataTable 
        ref="dataTableRef"
        :columns="columns" 
        :data="props.citizens.data"
        :loading="serverOps.isLoading"
        :expanded-content="createExpandedContent"
        class="bg-card rounded-lg border"
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
