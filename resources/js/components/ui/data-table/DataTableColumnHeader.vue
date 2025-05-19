<!-- 
  ไฟล์: resources/js/components/ui/data-table/DataTableColumnHeader.vue
  รองรับ multiple sort (Shift+คลิก) และ clear sort (ลบการ sort เฉพาะคอลัมน์นั้น)
  ใช้ icon จาก lucide-vue-next เท่านั้น
-->

<script setup lang="ts">
// นำเข้า type Column จาก @tanstack/vue-table สำหรับควบคุมการทำงานของคอลัมน์
import type { Column } from '@tanstack/vue-table'

// นำเข้า icon จาก lucide-vue-next
import { 
  ArrowDown as ArrowDownIcon,
  ArrowUp as ArrowUpIcon,
  ArrowUpDown as CaretSortIcon,
  EyeOff as EyeNoneIcon,
  X as ClearIcon
} from 'lucide-vue-next'

// นำเข้า cn สำหรับจัดการ class tailwind
import { cn } from '@/lib/utils'

// นำเข้า Button และ DropdownMenu สำหรับ UI
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// รับ props: column (object ของคอลัมน์) และ title (ชื่อหัวคอลัมน์)
interface DataTableColumnHeaderProps {
  column: Column<any>
  title: string
}
defineProps<DataTableColumnHeaderProps>()
</script>

<script lang="ts">
// ปิด inheritAttrs เพื่อไม่ให้ attribute ที่ไม่ต้องการถูกส่งไปยัง div
export default {
  inheritAttrs: false,
}
</script>

<template>
  <!-- ถ้าคอลัมน์นี้สามารถ sort ได้ -->
  <div v-if="column.getCanSort()" :class="cn('flex items-center space-x-2', $attrs.class ?? '')">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="-ml-3 h-8 data-[state=open]:bg-accent"
          @click="(e) => {
            // รองรับ multiple sort ด้วย Shift+Click
            // toggleSorting(desc, isMulti)
            if (e.shiftKey) {
              column.toggleSorting(undefined, true)
            } else {
              column.toggleSorting()
            }
          }"
        >
          <!-- แสดงชื่อหัวคอลัมน์ -->
          <span>{{ title }}</span>
          <!-- แสดง icon ตามสถานะการ sort -->
          <ArrowDownIcon v-if="column.getIsSorted() === 'desc'" class="w-4 h-4 ml-2" />
          <ArrowUpIcon v-else-if="column.getIsSorted() === 'asc'" class="w-4 h-4 ml-2" />
          <CaretSortIcon v-else class="w-4 h-4 ml-2" />
          <!-- แสดงลำดับ sort ถ้ามี multiple sort -->
          <span
            v-if="typeof column.getSortIndex === 'function' && column.getIsSorted()"
            class="ml-1 text-xs text-muted-foreground"
          >
            {{ column.getSortIndex() + 1 }}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <!-- เมนูเรียงจากน้อยไปมาก (Asc) -->
        <DropdownMenuItem @click="column.toggleSorting(false, $event.shiftKey)">
          <ArrowUpIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Sort ascending
        </DropdownMenuItem>
        <!-- เมนูเรียงจากมากไปน้อย (Desc) -->
        <DropdownMenuItem @click="column.toggleSorting(true, $event.shiftKey)">
          <ArrowDownIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Sort descending
        </DropdownMenuItem>
        <!-- เมนูลบการ sort เฉพาะคอลัมน์นี้ -->
        <DropdownMenuItem v-if="column.getIsSorted()" @click="column.clearSorting()">
          <ClearIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Clear sort
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <!-- เมนูซ่อนคอลัมน์ -->
        <DropdownMenuItem @click="column.toggleVisibility(false)">
          <EyeNoneIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <!-- ถ้าคอลัมน์นี้ไม่สามารถ sort ได้ -->
  <div v-else :class="$attrs.class">
    {{ title }}
  </div>
</template>
