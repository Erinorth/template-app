<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { type BreadcrumbItem } from '@/types'
import { Head, Link } from '@inertiajs/vue3'
import { HeaderWithTitle } from '@/components/custom/header-with-title'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/custom/data-table/DataTable.vue'
import DataTablePagination from '@/components/custom/data-table/DataTablePagination.vue'
import type { Citizen } from '@/types/citizen'
import type { LengthAwarePaginator } from '@/types/pagination'
import { useCitizenColumns } from '@/composables/useCitizenColumns'
import { useServerPagination } from '@/composables/useServerPagination'

const props = defineProps<{ citizens: LengthAwarePaginator<Citizen> }>()

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Citizens', href: '/citizens' },
]

const { columns } = useCitizenColumns()

// ใช้ composable เพื่อสร้าง handlers สำหรับ Inertia
const { goPage, changePageSize } = useServerPagination({
  routeName: 'citizens.index',
  currentPage: props.citizens.current_page,
  totalPages: props.citizens.last_page,
  perPage: props.citizens.per_page,
})
</script>

<template>
  <Head title="Citizens" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <HeaderWithTitle
        :title="$page.props.title ?? 'Citizens'"
        subtitle="ข้อมูลประชาชนในระบบ"
        description="ตารางโหมดง่าย + แบ่งหน้าฝั่งเซิร์ฟเวอร์"
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

      <!-- ส่งเฉพาะข้อมูลในหน้าปัจจุบัน -->
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
