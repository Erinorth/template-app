<!-- resources/js/pages/DataTableDemo/DataTableDemo.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { Head } from '@inertiajs/vue3';
import { 
  BarChart3, 
  Building2, 
  Users, 
  Settings
} from 'lucide-vue-next';
import AppLayout from '@/layouts/AppLayout.vue';
import DataTable from '@/components/ui/data-table2/DataTable.vue';
import type { BreadcrumbItem, TableConfig, TableColumn } from '@/types';
import {
  sampleRiskAssessments,
  sampleOrganizationalRisks,
  sampleDivisionRisks,
  sampleLikelihoodCriteria,
  sampleImpactCriteria
} from '@/lib/sample-data';

// กำหนด breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'ระบบประเมินความเสี่ยง',
    href: '/data-table-demo',
  },
];

// กำหนด active tab
const activeTab = ref('assessments');

// กำหนด tabs
const tabs = [
  { key: 'assessments', label: 'การประเมินความเสี่ยง', icon: BarChart3 },
  { key: 'organizational', label: 'ความเสี่ยงองค์กร', icon: Building2 },
  { key: 'division', label: 'ความเสี่ยงแผนก', icon: Users },
  { key: 'criteria', label: 'เกณฑ์การประเมิน', icon: Settings }
];

// กำหนดคอลัมน์สำหรับ Risk Assessments
const riskAssessmentsColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '80px',
    align: 'center',
    type: 'number'
  },
  {
    key: 'assessment_year',
    label: 'ปี',
    sortable: true,
    width: '100px',
    align: 'center',
    type: 'number'
  },
  {
    key: 'assessment_period',
    label: 'ไตรมาส',
    sortable: true,
    width: '100px',
    align: 'center',
    format: (value) => `Q${value}`
  },
  {
    key: 'division_risk_id',
    label: 'ความเสี่ยง',
    sortable: true,
    format: (value) => {
      const risk = sampleDivisionRisks.find(r => r.id === value);
      return risk?.risk_name || '-';
    }
  },
  {
    key: 'likelihood_level',
    label: 'โอกาสเกิด',
    sortable: true,
    width: '120px',
    align: 'center',
    type: 'badge',
    format: (value) => {
      const levels = ['', 'ต่ำมาก', 'ต่ำ', 'ปานกลาง', 'สูง'];
      return levels[value] || '-';
    }
  },
  {
    key: 'impact_level',
    label: 'ผลกระทบ',
    sortable: true,
    width: '120px',
    align: 'center',
    type: 'badge',
    format: (value) => {
      const levels = ['', 'น้อย', 'ปานกลาง', 'สูง', 'รุนแรง'];
      return levels[value] || '-';
    }
  },
  {
    key: 'risk_score',
    label: 'คะแนนความเสี่ยง',
    sortable: true,
    width: '150px',
    align: 'center',
    type: 'badge'
  },
  {
    key: 'created_at',
    label: 'วันที่สร้าง',
    sortable: true,
    width: '150px',
    type: 'date'
  }
];

// กำหนดคอลัมน์สำหรับ Organizational Risks
const organizationalRisksColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '80px',
    align: 'center',
    type: 'number'
  },
  {
    key: 'risk_name',
    label: 'ชื่อความเสี่ยง',
    sortable: true,
    searchable: true
  },
  {
    key: 'description',
    label: 'คำอธิบาย',
    searchable: true,
    format: (value) => value.length > 80 ? value.substring(0, 80) + '...' : value
  },
  {
    key: 'created_at',
    label: 'วันที่สร้าง',
    sortable: true,
    width: '150px',
    type: 'date'
  }
];

// กำหนดคอลัมน์สำหรับ Division Risks
const divisionRisksColumns: TableColumn[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '80px',
    align: 'center',
    type: 'number'
  },
  {
    key: 'risk_name',
    label: 'ชื่อความเสี่ยง',
    sortable: true,
    searchable: true
  },
  {
    key: 'organizational_risk_id',
    label: 'ความเสี่ยงหลัก',
    sortable: true,
    width: '200px',
    format: (value) => {
      if (!value) return '-';
      const risk = sampleOrganizationalRisks.find(r => r.id === value);
      return risk?.risk_name || '-';
    }
  },
  {
    key: 'description',
    label: 'คำอธิบาย',
    searchable: true,
    format: (value) => value.length > 60 ? value.substring(0, 60) + '...' : value
  },
  {
    key: 'created_at',
    label: 'วันที่สร้าง',
    sortable: true,
    width: '150px',
    type: 'date'
  }
];

// กำหนดคอลัมน์สำหรับ Likelihood Criteria
const likelihoodCriteriaColumns: TableColumn[] = [
  {
    key: 'level',
    label: 'ระดับ',
    sortable: true,
    width: '80px',
    align: 'center',
    type: 'number'
  },
  {
    key: 'name',
    label: 'ชื่อ',
    sortable: true,
    width: '120px'
  },
  {
    key: 'description',
    label: 'คำอธิบาย',
    searchable: true
  }
];

// กำหนดคอลัมน์สำหรับ Impact Criteria
const impactCriteriaColumns: TableColumn[] = [
  {
    key: 'level',
    label: 'ระดับ',
    sortable: true,
    width: '80px',
    align: 'center',
    type: 'number'
  },
  {
    key: 'name',
    label: 'ชื่อ',
    sortable: true,
    width: '150px'
  },
  {
    key: 'description',
    label: 'คำอธิบาย',
    searchable: true
  }
];

// สร้าง table configurations
const riskAssessmentsTableConfig = computed((): TableConfig => ({
  data: sampleRiskAssessments,
  columns: riskAssessmentsColumns,
  searchable: true,
  sortable: true,
  pagination: true,
  pageSize: 10,
  loading: false,
  emptyMessage: 'ไม่พบข้อมูลการประเมินความเสี่ยง'
}));

const organizationalRisksTableConfig = computed((): TableConfig => ({
  data: sampleOrganizationalRisks,
  columns: organizationalRisksColumns,
  searchable: true,
  sortable: true,
  pagination: true,
  pageSize: 10,
  loading: false,
  emptyMessage: 'ไม่พบข้อมูลความเสี่ยงระดับองค์กร'
}));

const divisionRisksTableConfig = computed((): TableConfig => ({
  data: sampleDivisionRisks,
  columns: divisionRisksColumns,
  searchable: true,
  sortable: true,
  pagination: true,
  pageSize: 10,
  loading: false,
  emptyMessage: 'ไม่พบข้อมูลความเสี่ยงระดับแผนก'
}));

const likelihoodCriteriaTableConfig = computed((): TableConfig => ({
  data: sampleLikelihoodCriteria,
  columns: likelihoodCriteriaColumns,
  searchable: true,
  sortable: true,
  pagination: false,
  loading: false,
  emptyMessage: 'ไม่พบข้อมูลเกณฑ์โอกาสเกิด'
}));

const impactCriteriaTableConfig = computed((): TableConfig => ({
  data: sampleImpactCriteria,
  columns: impactCriteriaColumns,
  searchable: true,
  sortable: true,
  pagination: false,
  loading: false,
  emptyMessage: 'ไม่พบข้อมูลเกณฑ์ผลกระทบ'
}));
</script>

<template>
  <Head title="ระบบประเมินความเสี่ยง" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
      <!-- Header -->
      <div class="space-y-2">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">ระบบประเมินความเสี่ยง</h1>
        <p class="text-gray-600 dark:text-gray-400">ตัวอย่างการแสดงผลข้อมูลด้วย Data Table</p>
      </div>

      <!-- Tab Navigation -->
      <div class="w-full">
        <nav class="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center',
              activeTab === tab.key
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            <component :is="tab.icon" class="h-4 w-4 mr-2" />
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- Data Tables -->
      <div class="space-y-6">
        <!-- Risk Assessments Table -->
        <div v-show="activeTab === 'assessments'" class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">การประเมินความเสี่ยง</h2>
          <DataTable :config="riskAssessmentsTableConfig" />
        </div>

        <!-- Organizational Risks Table -->
        <div v-show="activeTab === 'organizational'" class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">ความเสี่ยงระดับองค์กร</h2>
          <DataTable :config="organizationalRisksTableConfig" />
        </div>

        <!-- Division Risks Table -->
        <div v-show="activeTab === 'division'" class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">ความเสี่ยงระดับแผนก</h2>
          <DataTable :config="divisionRisksTableConfig" />
        </div>

        <!-- Criteria Tables -->
        <div v-show="activeTab === 'criteria'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">เกณฑ์โอกาสเกิด</h2>
            <DataTable :config="likelihoodCriteriaTableConfig" />
          </div>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">เกณฑ์ผลกระทบ</h2>
            <DataTable :config="impactCriteriaTableConfig" />
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
