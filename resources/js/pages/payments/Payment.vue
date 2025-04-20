<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/vue3';
import PlaceholderPattern from '@/components/PlaceholderPattern.vue';
import { usePaymentData } from '@/features/payments/usePaymentData';
import type { Payment } from '@/features/payments/payment';
import { columns } from '@/features/payments/columns';
import DataTable from '@/features/payments/DataTable.vue';

const props = defineProps<{
  payments: Payment[];
}>();

const { data, updatePayment } = usePaymentData(props.payments);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment',
        href: '/payment',
    },
];
</script>

<template>
    <Head title="Payment" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
          <DataTable :columns="columns" :data="data" :meta="{ updateData: updatePayment }" />
        </div>
    </AppLayout>
</template>
