<!-- ไฟล์: resources/js/components/custom/data-table/BaseFilter.vue -->
<script setup lang="ts" generic="TData">
import type { Column } from '@tanstack/vue-table'
import { Filter, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { computed } from 'vue'

interface Props {
  column: Column<TData, any>
  title: string
  filterCount?: number
  hasFilter?: boolean
  popoverWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  filterCount: 0,
  hasFilter: false,
  popoverWidth: 'w-[280px]'
})

const emit = defineEmits<{
  clearFilter: []
}>()

// คำนวณ variant ของปุ่ม
const buttonVariant = computed(() => props.hasFilter ? 'default' : 'outline')

// คำนวณการแสดง badge
const showBadge = computed(() => props.filterCount > 0)
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        :variant="buttonVariant"
        size="sm"
        class="h-8"
      >
        <Filter class="w-4 h-4 mr-2" />
        {{ title }}
        <Badge
          v-if="showBadge"
          variant="secondary"
          class="ml-2 rounded-sm px-1 font-normal"
        >
          {{ filterCount }}
        </Badge>
      </Button>
    </PopoverTrigger>
    <PopoverContent :class="`${popoverWidth} p-0`" align="start">
      <div class="p-4 space-y-4">
        <!-- Header พร้อม Clear button -->
        <div class="flex items-center justify-between">
          <h4 class="font-medium text-sm">{{ title }}</h4>
          <Button
            v-if="hasFilter"
            variant="ghost"
            size="sm"
            @click="emit('clearFilter')"
            class="h-auto p-1"
          >
            <X class="w-3 h-3" />
          </Button>
        </div>
        
        <!-- เนื้อหาจาก slot -->
        <slot :clear-filter="() => emit('clearFilter')" />
      </div>
    </PopoverContent>
  </Popover>
</template>
