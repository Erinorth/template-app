<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { type BreadcrumbItem } from '@/types'
import { Head, Link } from '@inertiajs/vue3'
import { HeaderWithTitle } from '@/components/custom/header-with-title'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/custom/data-table/DataTable.vue'
import DataTablePagination from '@/components/custom/data-table/DataTablePagination.vue'
import DataTableSearch from '@/components/custom/data-table/DataTableSearch.vue'
import type { Citizen } from '@/types/citizen'
import type { LengthAwarePaginator } from '@/types/pagination'
import { useCitizenColumns } from '@/composables/useCitizenColumns'
import { useServerSort } from '@/composables/useServerSort'
import { useServerPagination } from '@/composables/useServerPagination'
import { computed, ref } from 'vue'
import { router } from '@inertiajs/vue3'

const props = defineProps<{
  title: string
  citizens: LengthAwarePaginator<Citizen>,
  sort: string,
  direction: string,
  query?: Record<string, any>
}>()

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Citizens', href: '/citizens' },
]

// Search state - เก็บเฉพาะค่าปัจจุบัน
const search = ref(props.query?.search ?? '')

// ฟังก์ชัน handle search จาก DataTableSearch
function handleSearch(searchValue: string) {
  router.get(route('citizens.index'), { 
    search: searchValue,
    sort: props.sort,
    direction: props.direction,
    per_page: props.citizens.per_page,
    page: 1, // reset เป็นหน้า 1 เมื่อ search
  }, {
    preserveState: true,
    replace: true,
    preserveScroll: true,
  })
}

// Server sort และ pagination logic
const currentSort = computed(() => props.sort)
const currentDirection = computed(() => props.direction)
const currentPage = computed(() => props.citizens.current_page)
const perPage = computed(() => props.citizens.per_page)

const { onSort } = useServerSort({
  routeName: 'citizens.index',
  sort: currentSort,
  direction: currentDirection,
  currentPage,
  perPage,
})

const { columns } = useCitizenColumns({
  onSort,
  currentSort: currentSort.value,
  currentDirection: currentDirection.value,
})

const { goPage, changePageSize } = useServerPagination({
  routeName: 'citizens.index',
  currentPage: currentPage.value,
  totalPages: props.citizens.last_page,
  perPage: perPage.value,
})
</script>

<template>
  <Head :title="props.title ?? 'Citizens'" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
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
      
      <DataTable :columns="columns" :data="props.citizens.data" />
      
      <DataTablePagination
        :total="props.citizens.total"
        :current-page="props.citizens.current_page"
        :total-pages="props.citizens.last_page"
        :page-size="props.citizens.per_page"
        :from="props.citizens.from"
        :to="props.citizens.to"
        :links="props.citizens.links"
        :page-size-options="[10,20,50,100]"
        @change:page="goPage"
        @change:pageSize="changePageSize"
      />
    </div>
  </AppLayout>
</template>

<!--
คอมเมนต์:
- ลบ useDebounce และ watch logic ออก เพื่อความเรียบง่าย
- ใช้ handleSearch เพื่อจัดการการค้นหาจาก DataTableSearch
- โค้ดสะอาดขึ้น เข้าใจง่ายขึ้น ตามหลัก single responsibility
- DataTableSearch รับผิดชอบ debounce logic ทั้งหมด
-->
