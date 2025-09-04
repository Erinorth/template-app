<script setup lang="ts" generic="TData">
import { computed } from 'vue'
import type { Table } from '@tanstack/vue-table'
import { X, Filter, Group, Ungroup } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import StatusFilter from './StatusFilter.vue'
import AmountRangeFilter from './AmountRangeFilter.vue'
import EmailFilter from './EmailFilter.vue'

interface Props {
  table: Table<TData>
  activeFiltersCount: number
  activeGroupingCount: number
  grouping: string[]
  // เพิ่ม: กำหนด mapping ของคอลัมน์ที่ต้องการใช้ฟิลเตอร์ เพื่อไม่ hardcode โดเมน
  filterColumnIds?: {
    status?: string
    amount?: string
    email?: string
  }
}
const props = defineProps<Props>()

const statusColumn = computed(() => {
  const id = props.filterColumnIds?.status ?? 'status'
  return props.table.getColumn(id)
})
const amountColumn = computed(() => {
  const id = props.filterColumnIds?.amount ?? 'amount'
  return props.table.getColumn(id)
})
const emailColumn = computed(() => {
  const id = props.filterColumnIds?.email ?? 'email'
  return props.table.getColumn(id)
})

const activeGroupings = computed(() => {
  return props.grouping.map((groupId) => {
    const column = props.table.getColumn(groupId)
    return { id: groupId, name: column?.columnDef.header || groupId }
  })
})

const emit = defineEmits<{ clearFilters: [] }>()
const clearGrouping = () => {
  try {
    props.table.resetGrouping()
  } catch (error) {
    console.warn('Clear grouping failed:', error)
  }
}
</script>

<template>
  <Card v-if="statusColumn || amountColumn || emailColumn || activeFiltersCount > 0 || activeGroupingCount > 0">
    <CardContent class="p-4">
      <div class="flex flex-col gap-4">
        <!-- Filter Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Filter class="w-4 h-4 text-muted-foreground" />
            <h3 class="font-medium text-sm">ตัวกรองและการจัดกลุ่ม</h3>
            <Badge 
              v-if="activeFiltersCount > 0" 
              variant="secondary" 
              class="text-xs"
            >
              {{ activeFiltersCount }} กรอง
            </Badge>
            <Badge 
              v-if="activeGroupingCount > 0" 
              variant="outline" 
              class="text-xs"
            >
              {{ activeGroupingCount }} กลุ่ม
            </Badge>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Clear Grouping Button -->
            <Button
              v-if="activeGroupingCount > 0"
              variant="ghost"
              size="sm"
              @click="clearGrouping"
              class="h-8 text-xs"
            >
              <Ungroup class="w-3 h-3 mr-1" />
              ยกเลิกการจัดกลุ่ม
            </Button>
            
            <!-- Clear Filters Button -->
            <Button
              v-if="activeFiltersCount > 0"
              variant="ghost"
              size="sm"
              @click="emit('clearFilters')"
              class="h-8 text-xs"
            >
              <X class="w-3 h-3 mr-1" />
              ล้างตัวกรอง
            </Button>
          </div>
        </div>

        <!-- Active Groupings Display -->
        <div v-if="activeGroupings.length > 0" class="space-y-2">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Group class="w-3 h-3" />
            <span>จัดกลุ่มตาม:</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="group in activeGroupings"
              :key="group.id"
              variant="outline"
              class="text-xs"
            >
              {{ group.name }}
            </Badge>
          </div>
          <Separator />
        </div>

        <!-- Filters Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Status Filter -->
          <div v-if="statusColumn">
            <label class="text-xs font-medium text-muted-foreground mb-2 block">
              กรองตามสถานะ
            </label>
            <StatusFilter :column="statusColumn" />
          </div>

          <!-- Amount Range Filter -->
          <div v-if="amountColumn">
            <label class="text-xs font-medium text-muted-foreground mb-2 block">
              กรองตามจำนวนเงิน
            </label>
            <AmountRangeFilter :column="amountColumn" />
          </div>

          <!-- Email Autocomplete Filter -->
          <div v-if="emailColumn">
            <label class="text-xs font-medium text-muted-foreground mb-2 block">
              กรองตามอีเมล
            </label>
            <EmailFilter :column="emailColumn" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
