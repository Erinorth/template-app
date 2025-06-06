<script setup lang="ts">
import type { Column } from '@tanstack/vue-table'
import type { Payment } from '@/types/payment'
import { useAmountRangeFilter } from '@/composables/useTableFilters'
import { DollarSign, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Props definition
interface Props {
  column: Column<Payment, any>
}

const props = defineProps<Props>()

// ใช้ composable สำหรับจัดการ amount range filter
const { filterValue, facetedMinMax, updateFilter, clearFilter, hasFilter } = useAmountRangeFilter(props.column)
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        :variant="hasFilter ? 'default' : 'outline'"
        size="sm"
        class="h-8 justify-start"
      >
        <DollarSign class="w-4 h-4 mr-2" />
        จำนวนเงิน
        <Badge
          v-if="hasFilter"
          variant="secondary"
          class="ml-2 rounded-sm px-1 font-normal"
        >
          1
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-80 p-0" align="start">
      <div class="p-4 space-y-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h4 class="font-medium text-sm">กรองตามจำนวนเงิน</h4>
          <Button
            v-if="hasFilter"
            variant="ghost"
            size="sm"
            @click="clearFilter"
            class="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            <X class="w-3 h-3 mr-1" />
            ล้าง
          </Button>
        </div>

        <!-- Range Info -->
        <div class="text-xs text-muted-foreground">
          ช่วง: ${{ facetedMinMax[0] }} - ${{ facetedMinMax[1] }}
        </div>

        <!-- Min Amount Input -->
        <div class="space-y-2">
          <label class="text-xs font-medium">จำนวนขั้นต่ำ</label>
          <div class="relative">
            <DollarSign class="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model.number="filterValue.min"
              type="number"
              :placeholder="`${facetedMinMax[0]}`"
              class="pl-8 h-8 text-sm"
              :min="facetedMinMax[0]"
              :max="facetedMinMax[1]"
              @input="updateFilter"
            />
          </div>
        </div>

        <!-- Max Amount Input -->
        <div class="space-y-2">
          <label class="text-xs font-medium">จำนวนสูงสุด</label>
          <div class="relative">
            <DollarSign class="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model.number="filterValue.max"
              type="number"
              :placeholder="`${facetedMinMax[1]}`"
              class="pl-8 h-8 text-sm"
              :min="facetedMinMax[0]"
              :max="facetedMinMax[1]"
              @input="updateFilter"
            />
          </div>
        </div>

        <!-- Current Filter Display -->
        <div
          v-if="hasFilter"
          class="pt-2 mt-2 border-t text-xs text-muted-foreground"
        >
          <span>กำลังกรอง: </span>
          <span class="font-medium">
            ${{ filterValue.min || facetedMinMax[0] }} - 
            ${{ filterValue.max || facetedMinMax[1] }}
          </span>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>
