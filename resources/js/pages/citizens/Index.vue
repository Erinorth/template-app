<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import type { BreadcrumbItem } from '@/types'
import { Head } from '@inertiajs/vue3'
import { HeaderWithTitle } from '@/components/custom/header-with-title'
import {
  DataTable,
  DataTablePagination,
  DataTableSearch,
  DataTableViewOption,
} from '@/components/custom/data-table'
import { AddDataButton } from '@/components/custom/add-data-button'
import CitizenModal from './Modal.vue'
import type { Citizen } from './types'
import type { LengthAwarePaginator } from '@/types/pagination'
import { useCitizens } from './use'
import { useCitizenColumns } from './columns'
import { useServerOperations } from '@/composables/useServerOperations'
import { computed, ref } from 'vue'
import { router } from '@inertiajs/vue3'

// Props definition จาก controller
const props = defineProps<{
  title: string
  citizens: LengthAwarePaginator<Citizen>
  sort: string
  direction: string
  query?: Record<string, any>
}>()

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: 'dashboard' },
  { title: 'Citizens', href: 'citizens' },
]

// Search state
const search = ref(props.query?.search ?? '')

// ref สำหรับ DataTable component
const dataTableRef = ref()

// State สำหรับ modal - ref แทน useModal composable
const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedCitizen = ref<Citizen | null>(null)

// Citizens composable logic
const { viewCitizen, deleteCitizen, handleCustomAction, createExpandedContent } =
  useCitizens()

// Server operations สำหรับ server-side pagination/sort/search
const serverOps = useServerOperations({
  routeName: 'citizens.index',
  currentPage: computed(() => props.citizens.current_page),
  totalPages: computed(() => props.citizens.last_page),
  perPage: computed(() => props.citizens.per_page),
  sort: computed(() => props.sort),
  direction: computed(() => props.direction as 'asc' | 'desc'),
  extra: computed(() => ({
    search: search.value,
    ...props.query,
  })),
})

// handle edit citizen จาก modal
function handleEditCitizen(citizen: Citizen) {
  console.log('[Citizens Index] Opening edit modal', {
    citizenId: citizen.id,
    citizenid: citizen.citizenid,
  })
  modalMode.value = 'edit'
  selectedCitizen.value = citizen
  modalOpen.value = true
}

// Columns definition พร้อม column handleEditCitizen และ editCitizen จาก useCitizens
const columns = useCitizenColumns(
  serverOps.onSort,
  viewCitizen,
  handleEditCitizen,
  deleteCitizen,
  handleCustomAction
)

// handle search
function handleSearch(searchValue: string) {
  search.value = searchValue
  console.log('[Citizens Index] Searching:', searchValue)

  serverOps.makeRequest({
    search: searchValue,
    sort: props.sort,
    direction: props.direction,
    perpage: props.citizens.per_page,
    page: 1, // reset เป็นหน้า 1 เมื่อ search
  })
}

// search จาก modal
function handleQuickCreate() {
  console.log('[Citizens Index] Opening quick create modal')
  modalMode.value = 'create'
  selectedCitizen.value = null
  modalOpen.value = true
}

// handle full create
function handleFullCreate() {
  console.log('[Citizens Index] Navigating to full create page')
  router.visit(route('citizens.create'))
}

// Handle เมื่อ modal success
function handleModalSuccess() {
  console.log('[Citizens Index] Modal saved successfully')
  // Inertia จะ refresh หน้าอัตโนมัติ
}

// Log สำหรับ debugging
console.log('[Citizens Index] Page initialized', {
  totalRecords: props.citizens.data.length,
  currentPage: props.citizens.current_page,
  totalPages: props.citizens.last_page,
})
</script>

<template>
  <Head :title="props.title ?? 'Citizens'" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- Header Section -->
      <HeaderWithTitle
        :title="props.title ?? 'Citizens'"
        subtitle="จัดการข้อมูลประชาชน"
        description="ค้นหา เพิ่ม แก้ไข ลบข้อมูลประชาชน พร้อม debounced search, expanding rows และ badge"
        badge="ใหม่"
        badge-variant="secondary"
        size="lg"
        align="left"
        with-gradient
      >
        <template #actions>
          <!-- AddDataButton พร้อม dropdown 2 options -->
          <AddDataButton
            button-text="เพิ่มข้อมูล"
            quick-create-label="สร้างด่วน"
            quick-create-description="สร้างข้อมูลด้วย Modal"
            full-create-label="สร้างแบบเต็ม"
            full-create-description="ไปหน้าสร้างข้อมูลแบบเต็ม"
            @quick-create="handleQuickCreate"
            @full-create="handleFullCreate"
          />
        </template>
      </HeaderWithTitle>

      <!-- Enhanced Toolbar Section -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-4 bg-card rounded-lg border">
        <!-- Search Section -->
        <div class="flex-1">
          <DataTableSearch
            v-model="search"
            :columns="['citizenid', 'remark', 'birthdate', 'id']"
            :debounce-delay="400"
            placeholder="ค้นหาด้วยเลขบัตร หมายเหตุ วันเกิด..."
            @search="handleSearch"
          />
        </div>

        <!-- Toolbar Actions -->
        <div class="flex items-center space-x-2">
          <!-- Summary Info -->
          <div class="hidden md:flex items-center text-sm text-muted-foreground mr-4">
            <span>{{ props.citizens.from }} - {{ props.citizens.to }} จาก {{ props.citizens.total }}</span>
          </div>

          <!-- Column Visibility Control -->
          <DataTableViewOption v-if="dataTableRef?.table" :table="dataTableRef.table" />
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
        :page-size-options="[10, 20, 50, 100]"
        @changepage="serverOps.goPage"
        @changepageSize="serverOps.changePageSize"
      />
    </div>

    <!-- Citizen Modal Component สำหรับ Create/Edit -->
    <CitizenModal
      v-model:open="modalOpen"
      :mode="modalMode"
      :citizen="selectedCitizen"
      @success="handleModalSuccess"
    />
  </AppLayout>
</template>
