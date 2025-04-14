<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { ref, watch } from 'vue';
import HeadingSmall from '@/components/HeadingSmall.vue';
import { type BreadcrumbItem } from '@/types';

// กำหนด interface สำหรับ User
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
};

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
                
                <!-- ตารางแสดงรายชื่อผู้ใช้งาน -->
                <div>
                    <table class="min-w-full bg-white border">
                        <thead>
                            <tr>
                                <th class="px-4 py-2 border">ID</th>
                                <th class="px-4 py-2 border">Name</th>
                                <th class="px-4 py-2 border">can read</th>
                                <th class="px-4 py-2 border">can create</th>
                                <th class="px-4 py-2 border">can edit</th>
                                <th class="px-4 py-2 border">can delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, index) in localUsers" :key="user.id">
                                <td class="px-4 py-2 border">{{ user.egat_id }}</td>
                                <td class="px-4 py-2 border">{{ user.name }}</td>
                                <!-- Checkbox สำหรับสิทธิ์ต่าง ๆ -->
                                <td class="px-4 py-2 border text-center">
                                    <input
                                        type="checkbox"
                                        v-model="user.can_read"
                                        @change="updatePermission(user, 'can_read')"
                                        class="form-checkbox h-5 w-5 text-blue-600"
                                    >
                                </td>
                                <td class="px-4 py-2 border text-center">
                                    <input
                                        type="checkbox"
                                        v-model="user.can_create"
                                        @change="updatePermission(user, 'can_create')"
                                        class="form-checkbox h-5 w-5 text-blue-600"
                                    >
                                </td>
                                <td class="px-4 py-2 border text-center">
                                    <input
                                        type="checkbox"
                                        v-model="user.can_edit"
                                        @change="updatePermission(user, 'can_edit')"
                                        class="form-checkbox h-5 w-5 text-blue-600"
                                    >
                                </td>
                                <td class="px-4 py-2 border text-center">
                                    <input
                                        type="checkbox"
                                        v-model="user.can_delete"
                                        @change="updatePermission(user, 'can_delete')"
                                        class="form-checkbox h-5 w-5 text-blue-600"
                                    >
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div v-if="showSuccess" class="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg">
                        {{ successMessage }}
                    </div>
                </div>
            </div>
        </SettingsLayout>
    </AppLayout>
</template>