<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { Head } from '@inertiajs/vue3';
import HeadingSmall from '@/components/HeadingSmall.vue';
import { type BreadcrumbItem } from '@/types';
import { columns } from '@/features/permission/components/data-table/columns';
import DataTable from '@/features/permission/components/data-table/DataTable.vue';
import { usePermissionData } from '@/features/permission/composables/usePermissionData';
import type { UserPermission } from '@/features/permission/types/permission';

// รับค่า props จาก Inertia
const props = defineProps<{
  users: UserPermission[];
}>();

const { data, updatePermission } = usePermissionData(props.users);

const breadcrumbs: BreadcrumbItem[] = [
{
  title: 'Permission Settings',
  href: '/settings/permission',
},
];
</script>

<template>
    <AppLayout :breadcrumbs="breadcrumbs">
        <Head title="Permission" />

        <SettingsLayout>
            <div class="space-y-6">
                <HeadingSmall 
                  title="Permission Management" 
                  description="Manage user permissions and roles within your application." 
                />
                <DataTable :columns="columns" :data="data" :meta="{ updateData: updatePermission }" />
            </div>
        </SettingsLayout>
    </AppLayout>
</template>