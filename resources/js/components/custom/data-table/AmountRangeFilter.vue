<!-- ไฟล์: resources/js/components/custom/data-table/AmountRangeFilter.vue -->
<script setup lang="ts" generic="TData">
import type { Column } from '@tanstack/vue-table'
import { useRangeFilter } from '@/composables/useTableFilters'
import { Input } from '@/components/ui/input'
import BaseFilter from './BaseFilter.vue'
import { computed } from 'vue'

interface Props {
  column: Column<TData, any>
}

const props = defineProps<Props>()

// ใช้ generic useRangeFilter
const { filterValue, facetedMinMax, updateFilter, clearFilter, hasFilter } = useRangeFilter(
  props.column,
  {
    successMessage: 'กรองจำนวนเงิน',
    clearMessage: 'ล้างการกรองจำนวนเงิน',
    unit: '$',
    defaultMin: 0,
    defaultMax: 10000
  }
)

// ฟังก์ชันจัดการการอัปเดตค่า
const handleMinUpdate = (value: string | number) => {
  filterValue.value.min = value ? Number(value) : undefined
  updateFilter()
}

const handleMaxUpdate = (value: string | number) => {
  filterValue.value.max = value ? Number(value) : undefined
  updateFilter()
}

// คำนวณจำนวนฟิลเตอร์ที่ใช้งาน
const activeFilterCount = computed(() => {
  let count = 0
  if (filterValue.value.min !== undefined) count++
  if (filterValue.value.max !== undefined) count++
  return count
})
</script>

<template>
  <BaseFilter
    :column="column"
    title="จำนวน"
    popover-width="w-[320px]"
    :filter-count="activeFilterCount"
    :has-filter="hasFilter"
    @clear-filter="clearFilter"
  >
    <!-- แสดงช่วงข้อมูลที่มีอยู่ -->
    <div class="text-xs text-muted-foreground mb-2">
      ช่วง: ${{ facetedMinMax[0] }} - ${{ facetedMinMax[1] }}
    </div>

    <!-- Input fields แบบ 2 คอลัมน์ -->
    <div class="grid grid-cols-2 gap-2">
      <!-- จำนวนขั้นต่ำ -->
      <div class="space-y-2">
        <label class="text-xs text-muted-foreground">จำนวนขั้นต่ำ</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            type="number"
            :placeholder="`${facetedMinMax[0]}`"
            :min="facetedMinMax[0]"
            :max="facetedMinMax[1]"
            :value="filterValue.min?.toString() || ''"
            @update:model-value="handleMinUpdate"
            class="pl-7"
          />
        </div>
      </div>

      <!-- จำนวนสูงสุด -->
      <div class="space-y-2">
        <label class="text-xs text-muted-foreground">จำนวนสูงสุด</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <Input
            type="number"
            :placeholder="`${facetedMinMax[1]}`"
            :min="facetedMinMax[0]"
            :max="facetedMinMax[1]"
            :value="filterValue.max?.toString() || ''"
            @update:model-value="handleMaxUpdate"
            class="pl-7"
          />
        </div>
      </div>
    </div>

    <!-- แสดงสถานะการกรองปัจจุบัน -->
    <div
      v-if="hasFilter"
      class="pt-2 mt-2 border-t text-xs text-muted-foreground"
    >
      <div class="flex items-center justify-between">
        <span>กำลังกรอง:</span>
        <span class="font-medium">
          ${{ filterValue.min || facetedMinMax[0] }} - 
          ${{ filterValue.max || facetedMinMax[1] }}
        </span>
      </div>
    </div>
  </BaseFilter>
</template>
