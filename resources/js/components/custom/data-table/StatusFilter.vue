<!-- ไฟล์: resources/js/components/custom/data-table/StatusFilter.vue -->
<script setup lang="ts" generic="TData">
import type { Column } from '@tanstack/vue-table'
import { useMultiSelectFilter } from '@/composables/useTableFilters'
import { Badge } from '@/components/ui/badge'
import BaseFilter from './BaseFilter.vue'

interface Props {
  column: Column<TData, any>
  statusLabels?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  statusLabels: () => ({
    pending: 'รอดำเนินการ',
    processing: 'กำลังประมวลผล',
    success: 'สำเร็จ',
    failed: 'ล้มเหลว',
  })
})

// ใช้ generic useMultiSelectFilter
const { selectedValues, facetedValues, toggleValue, clearFilter } = useMultiSelectFilter(
  props.column,
  props.statusLabels,
  {
    successMessage: 'กรองตามสถานะ',
    clearMessage: 'ล้างการกรองสถานะ'
  }
)
</script>

<template>
  <BaseFilter
    :column="column"
    title="สถานะ"
    :filter-count="selectedValues.length"
    :has-filter="selectedValues.length > 0"
    @clear-filter="clearFilter"
  >
    <!-- เนื้อหาการกรอง -->
    <div class="space-y-2">
      <div
        v-for="option in facetedValues"
        :key="option.value"
        class="flex items-center justify-between space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
        @click="toggleValue(option.value)"
      >
        <label
          class="text-sm font-normal cursor-pointer select-none"
        >
          {{ option.label }}
        </label>
        <span class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {{ option.count }}
        </span>
      </div>
    </div>
    
    <!-- แสดงสถานะที่เลือกอยู่ -->
    <div
      v-if="selectedValues.length > 0"
      class="pt-2 mt-2 border-t text-xs text-muted-foreground"
    >
      <span>กำลังกรอง: {{ selectedValues.length }} สถานะ</span>
      <div class="flex flex-wrap gap-1 mt-1">
        <Badge
          v-for="value in selectedValues"
          :key="value"
          variant="secondary"
          class="text-xs px-1.5 py-0.5"
        >
          {{ facetedValues.find(f => f.value === value)?.label || value }}
        </Badge>
      </div>
    </div>
  </BaseFilter>
</template>
