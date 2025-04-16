<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import { columns } from '@/features/permission/components/data-table/columns';
import DataTable from '@/features/permission/components/data-table/DataTable.vue';
import { ref, onMounted } from 'vue';

// กำหนด interface สำหรับข้อมูลผู้ใช้และสิทธิ์
interface UserPermission {
  id: number | string;
  egat_id: string;
  name: string;
  can_read: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  [key: string]: any;
}

// รับค่า props จาก Inertia
const props = defineProps<{
  users: UserPermission[];
}>();

// สร้าง reactive reference สำหรับเก็บข้อมูลผู้ใช้
const data = ref<UserPermission[]>([]);

// เรียกใช้ฟังก์ชัน getData ใน onMounted
onMounted(async () => {
  // ใช้ข้อมูลจาก props หรือเรียก API ถ้าจำเป็น
  data.value = props.users && props.users.length > 0 
    ? [...props.users] // สร้าง array ใหม่เพื่อป้องกัน reference issues
    : await getData();
});

// ฟังก์ชันสำหรับโหลดข้อมูลจาก API (หากจำเป็น)
async function getData(): Promise<UserPermission[]> {
  try {
    const response = await fetch('/settings/permission');
    return await response.json();
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
    return [];
  }
}

// ฟังก์ชันสำหรับอัปเดตข้อมูล
const updatePermission = async (id: number | string, field: string, value: boolean) => {
  // อัปเดตข้อมูลในแอปพลิเคชัน
  const userIndex = data.value.findIndex(user => user.id === id);
  if (userIndex !== -1) {
    data.value[userIndex][field] = value;
    
    // สร้าง array ใหม่เพื่อกระตุ้น reactivity
    data.value = [...data.value];
  }
  
  // ส่งข้อมูลไปยัง API เพื่ออัปเดตในฐานข้อมูล
  try {
    const response = await fetch('/settings/permission/update', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({ 
        id: id,
        [field]: value 
      }),
    });
    
    if (!response.ok) {
      // จัดการกับข้อผิดพลาด
      console.error('ไม่สามารถอัปเดตสิทธิ์ได้');
      // คืนค่าเดิม
      data.value[userIndex][field] = !value;
      // สร้าง array ใหม่เพื่อกระตุ้น reactivity
      data.value = [...data.value];
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    // คืนค่าเดิม
    data.value[userIndex][field] = !value;
    // สร้าง array ใหม่เพื่อกระตุ้น reactivity
    data.value = [...data.value];
  }
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Data Table',
    href: '/data_table',
  },
];
</script>

<template>
  <Head title="Dashboard" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <div class="relative min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <DataTable 
          :columns="columns" 
          :data="data" 
          :meta="{ updateData: updatePermission }"
        />
      </div>
    </div>
  </AppLayout>
</template>
