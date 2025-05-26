<template>
  <div class="w-full space-y-4">
    <!-- Search Bar -->
    <div v-if="config.searchable" class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div class="relative w-full sm:w-auto sm:min-w-[300px]">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาข้อมูล..."
          class="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <!-- Page Size Selector -->
      <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-600">แสดง</span>
        <select
          v-model="pageSize"
          class="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
        <span class="text-gray-600">รายการ</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="config.loading" class="flex justify-center items-center h-48">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <!-- Table Header -->
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="column in config.columns"
                :key="String(column.key)"
                :class="[
                  'px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.align === 'center' ? 'text-center' : 
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.sortable && config.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                ]"
                :style="{ width: column.width }"
                @click="column.sortable && config.sortable ? handleSort(column.key as keyof any) : null"
              >
                <div class="flex items-center gap-1" :class="column.align || 'justify-start'">
                  <span>{{ column.label }}</span>
                  <div v-if="column.sortable && config.sortable" class="flex flex-col">
                    <ChevronUp 
                      :class="[
                        'h-3 w-3 transition-colors',
                        sortField === column.key && sortDirection === 'asc' 
                          ? 'text-blue-500' 
                          : 'text-gray-300'
                      ]"
                    />
                    <ChevronDown 
                      :class="[
                        'h-3 w-3 -mt-1 transition-colors',
                        sortField === column.key && sortDirection === 'desc' 
                          ? 'text-blue-500' 
                          : 'text-gray-300'
                      ]"
                    />
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Empty State -->
            <tr v-if="paginatedData.length === 0">
              <td :colspan="config.columns.length" class="px-4 py-8 text-center text-gray-500">
                <div class="flex flex-col items-center gap-2">
                  <FileX class="h-8 w-8 text-gray-400" />
                  <span>{{ config.emptyMessage || 'ไม่พบข้อมูล' }}</span>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr 
              v-else
              v-for="(row, index) in paginatedData" 
              :key="index"
              class="hover:bg-gray-50 transition-colors"
            >
              <td
                v-for="column in config.columns"
                :key="String(column.key)"
                :class="[
                  'px-4 py-3 whitespace-nowrap text-sm',
                  column.align === 'center' ? 'text-center' : 
                  column.align === 'right' ? 'text-right' : 'text-left'
                ]"
              >
                <!-- Custom Component -->
                <component
                  v-if="column.component"
                  :is="column.component"
                  :value="getColumnValue(row, column)"
                  :row="row"
                  :column="column"
                />
                
                <!-- Badge Type -->
                <span
                  v-else-if="column.type === 'badge'"
                  :class="getBadgeClass(getColumnValue(row, column))"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ formatValue(row, column) }}
                </span>

                <!-- Number Type -->
                <span
                  v-else-if="column.type === 'number'"
                  class="font-mono"
                >
                  {{ formatValue(row, column) }}
                </span>

                <!-- Date Type -->
                <span
                  v-else-if="column.type === 'date'"
                  class="text-gray-600"
                >
                  {{ formatValue(row, column) }}
                </span>

                <!-- Default Text -->
                <span v-else class="text-gray-900">
                  {{ formatValue(row, column) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div 
        v-if="config.pagination && totalPages > 1" 
        class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6"
      >
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <!-- Results Info -->
          <div class="text-sm text-gray-700">
            แสดง {{ ((currentPage - 1) * pageSize) + 1 }} - 
            {{ Math.min(currentPage * pageSize, totalItems) }} 
            จาก {{ totalItems }} รายการ
          </div>

          <!-- Pagination Controls -->
          <div class="flex items-center gap-1">
            <!-- First Page -->
            <button
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsLeft class="h-4 w-4" />
            </button>

            <!-- Previous Page -->
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft class="h-4 w-4" />
            </button>

            <!-- Page Numbers -->
            <template v-for="page in getVisiblePages()" :key="page">
              <button
                v-if="page !== '...'"
                @click="goToPage(page as number)"
                :class="[
                  'px-3 py-2 rounded-md border text-sm font-medium',
                  page === currentPage
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <span v-else class="px-3 py-2 text-gray-500">...</span>
            </template>

            <!-- Next Page -->
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight class="h-4 w-4" />
            </button>

            <!-- Last Page -->
            <button
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronsRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed } from 'vue';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileX 
} from 'lucide-vue-next';
import { useDataTable } from '@/composables/useDataTable';
import type { TableConfig, TableColumn } from '@/types/risk-assessment';

// Props
interface Props {
  config: TableConfig<T>;
}

const props = defineProps<Props>();

// ใช้ composable สำหรับ table functionality
const {
  searchQuery,
  sortField,
  sortDirection,
  currentPage,
  pageSize,
  paginatedData,
  totalItems,
  totalPages,
  handleSort,
  goToPage
} = useDataTable({
  data: props.config.data,
  pageSize: props.config.pageSize || 10
});

// ฟังก์ชันสำหรับดึงค่าจาก column
const getColumnValue = (row: T, column: TableColumn<T>) => {
  const keys = String(column.key).split('.');
  let value = row as any;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined || value === null) break;
  }
  
  return value;
};

// ฟังก์ชันสำหรับ format ค่า
const formatValue = (row: T, column: TableColumn<T>) => {
  const value = getColumnValue(row, column);
  
  if (column.format) {
    return column.format(value, row);
  }
  
  if (column.type === 'date' && value) {
    return new Date(value).toLocaleDateString('th-TH');
  }
  
  if (column.type === 'number' && typeof value === 'number') {
    return value.toLocaleString('th-TH');
  }
  
  return value ?? '-';
};

// ฟังก์ชันสำหรับ badge class
const getBadgeClass = (value: any) => {
  // กำหนด class ตามค่า risk score
  if (typeof value === 'number') {
    if (value >= 16) return 'bg-red-100 text-red-800'; // สูงมาก
    if (value >= 9) return 'bg-orange-100 text-orange-800'; // สูง
    if (value >= 4) return 'bg-yellow-100 text-yellow-800'; // ปานกลาง
    return 'bg-green-100 text-green-800'; // ต่ำ
  }
  
  // กำหนด class ตามสถานะ
  const statusClasses: Record<string, string> = {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-gray-100 text-gray-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-blue-100 text-blue-800'
  };
  
  return statusClasses[String(value).toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// ฟังก์ชันสำหรับแสดงหน้าที่มองเห็นได้
const getVisiblePages = () => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 7) {
    // แสดงทุกหน้าถ้าไม่เกิน 7 หน้า
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // แสดงหน้าแบบย่อ
    pages.push(1);
    
    if (current > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (current < total - 2) {
      pages.push('...');
    }
    
    pages.push(total);
  }
  
  return pages;
};
</script>
