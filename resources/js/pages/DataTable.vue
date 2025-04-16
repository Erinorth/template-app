<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import PlaceholderPattern from '../components/PlaceholderPattern.vue';

import SettingsLayout from '@/layouts/settings/Layout.vue';
import { useForm } from '@inertiajs/vue3';
import { ref, watch } from 'vue';
import HeadingSmall from '@/components/HeadingSmall.vue';

import type { Permission } from '@/components/permission-data-table/columns'
import { onMounted } from 'vue'
import { columns } from '@/components/permission-data-table/columns'
import DataTable from '@/components/permission-data-table/DataTable.vue'

// รับค่า props จาก Inertia
const props = defineProps<{
  users: UserPermission[];
}>();

// สร้าง reactive reference สำหรับเก็บข้อมูลผู้ใช้
const data = ref<UserPermission[]>([]);

// ฟังก์ชันสำหรับโหลดข้อมูลจาก props
async function getData(): Promise<UserPermission[]> {
  try {
    // ในกรณีที่ข้อมูลมาจาก props ของ Inertia
    if (props.users && props.users.length > 0) {
      return props.users;
    } 
    // กรณีข้อมูลไม่มาจาก props (อาจเกิดกรณีนี้หากมีการเปลี่ยนแปลงการทำงาน)
    else {
      // ทำการเรียก API โดยตรงด้วย Axios หากจำเป็น
      const response = await axios.get('/api/permissions');
      return response.data;
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
    return [];
  }
}

// เรียกใช้ฟังก์ชัน getData ใน onMounted
onMounted(async () => {
  data.value = await getData();
});

/* // กำหนด props
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
        title: 'Data Table',
        href: '/data_table',
    },
];
</script>

<template>
    <Head title="Data Table" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
            <div class="relative min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                <DataTable :columns="columns" :data="data" />
            </div>
        </div>
    </AppLayout>
</template>
