<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref, watch } from 'vue';
import HeadingSmall from '@/components/HeadingSmall.vue';
import { type BreadcrumbItem } from '@/types';

import type { Payment } from '@/components/ui/data-table/columns'
import { onMounted } from 'vue'
import { columns } from '@/components/ui/data-table/columns'
import DataTable from '@/components/ui/data-table/DataTable.vue'

const data = ref<Payment[]>([])

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
        id: '728ed52f',
        amount: 100,
        status: 'pending',
        email: 'm@example.com',
    },
    {
        id: '489e1d42',
        amount: 125,
        status: 'processing',
        email: 'example@gmail.com',
    },
    // ...
  ]
}

onMounted(async () => {
  data.value = await getData()
})

/* // กำหนด interface สำหรับ User
interface User {
  id: number
  egat_id: string
  name: string
  can_read: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

// กำหนด props
const props = defineProps({
    users: {
        type: Array as () => User[], // ระบุประเภทให้ชัดเจน
        required: true,
    },
});

// สร้างตัวแปรเพื่อเก็บข้อมูลผู้ใช้ที่สามารถแก้ไขได้
const localUsers = ref<User[]>(JSON.parse(JSON.stringify(props.users)));

const successMessage = ref('');
const showSuccess = ref(false);

// ฟังก์ชันสำหรับอัปเดตสิทธิ์
const updatePermission = (user: User, permission: string) => {
    const form = useForm({
        user_id: user.id,
        permission: permission,
        value: user[permission as keyof User]
    });

    form.patch(`/settings/permission/update`, {
        preserveScroll: true,
        onSuccess: () => {
            successMessage.value = `อัปเดตสิทธิ์ ${permission} สำหรับ ${user.name} เรียบร้อยแล้ว`;
            showSuccess.value = true;
            
            // ซ่อนข้อความหลังจาก 3 วินาที
            setTimeout(() => {
                showSuccess.value = false;
            }, 3000);
        },
    });
}; */

const breadcrumbItems: BreadcrumbItem[] = [
    {
        title: 'Permission Settings',
        href: '/settings/permission',
    },
];
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbItems">
        <Head title="Permission" />

        <SettingsLayout>
            <div class="space-y-6">
                <HeadingSmall 
                  title="Permission Management" 
                  description="Manage user permissions and roles within your application." 
                />
                <div class="container py-10 mx-auto">
                    <DataTable :columns="columns" :data="data" />
                </div>
            </div>
        </SettingsLayout>
    </AppLayout>
</template>