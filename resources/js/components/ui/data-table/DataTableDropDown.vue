<!-- resources/js/components/ui/data-table/DataTableDropDown.vue -->
<script setup lang="ts">
// นำเข้า Button และ DropdownMenu ที่จำเป็น
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-vue-next'

// กำหนด props สำหรับรับรายการเมนูและ label
defineProps<{
  items: Array<{
    label: string
    action: () => void
    type?: 'item' | 'separator' | 'label'
  }>
  label?: string
}>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="w-8 h-8 p-0">
        <span class="sr-only">Open menu</span>
        <MoreHorizontal class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel v-if="label">{{ label }}</DropdownMenuLabel>
      <template v-for="(item, idx) in items" :key="idx">
        <DropdownMenuSeparator v-if="item.type === 'separator'" />
        <DropdownMenuItem v-else-if="item.type !== 'label'" @click="item.action">
          {{ item.label }}
        </DropdownMenuItem>
        <DropdownMenuLabel v-else>{{ item.label }}</DropdownMenuLabel>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
