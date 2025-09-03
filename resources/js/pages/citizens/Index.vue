<!-- resources/js/pages/citizens/Index.vue -->
<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { type BreadcrumbItem } from '@/types'
import { Head, Link } from '@inertiajs/vue3'
import { HeaderWithTitle } from '@/components/custom/header-with-title'
import { Button } from '@/components/ui/button'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Citizens', href: '/citizens' },
]
</script>

<template>
  <Head title="Citizens" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- ใช้ HeaderWithTitle -->
      <HeaderWithTitle
        :title="$page.props.title ?? 'Citizens'"
        subtitle="ข้อมูลประชาชนในระบบ"
        description="จัดการบันทึก แก้ไข และตรวจสอบสถานะของข้อมูลประชาชนได้จากหน้าเดียว รองรับการกรองและการค้นหา"
        badge="รายการ"
        badge-variant="secondary"
        size="lg"
        align="left"
        with-gradient
      >
        <!-- ปุ่ม action -->
        <template #actions>
          <Button as-child>
            <Link :href="route('citizens.create')">
              เพิ่มข้อมูล
            </Link>
          </Button>
        </template>
      </HeaderWithTitle>

      <!-- เนื้อหาเดิม -->
      <div class="grid auto-rows-min gap-4 md:grid-cols-3">
        <p class="text-muted-foreground mt-2">หน้าทดสอบการแสดงผลผ่าน Inertia + Vue 3</p>
      </div>
    </div>
  </AppLayout>
</template>
