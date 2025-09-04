<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { type BreadcrumbItem } from '@/types'
import { Head, Link } from '@inertiajs/vue3'
import { HeaderWithTitle } from '@/components/custom/header-with-title'
import { Button } from '@/components/ui/button'

// ใช้ DataTable generic (ไม่แสดงโค้ดภายในตามคำขอ)
import DataTable from '@/components/custom/data-table/DataTable.vue'

import type { Citizen } from '@/types/citizen'
import { useCitizenColumns } from '@/composables/useCitizenColumns'

const props = defineProps<{ citizens: Citizen[] }>()

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Citizens', href: '/citizens' },
]

const { columns } = useCitizenColumns()
</script>

<template>
  <Head title="Citizens" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <HeaderWithTitle
        :title="$page.props.title ?? 'Citizens'"
        subtitle="ข้อมูลประชาชนในระบบ"
        description="ตารางโหมดง่าย: ไม่เปิดค้นหา/กรอง/จัดหน้า/เรียงลำดับ"
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

      <DataTable :columns="columns" :data="props.citizens" />
    </div>
  </AppLayout>
</template>
