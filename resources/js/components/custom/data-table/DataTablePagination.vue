<script setup lang="ts">
import { computed } from 'vue'
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ServerPaginationProps, PaginationLink } from '@/types/pagination'

interface Props extends ServerPaginationProps {}
const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [10, 20, 50, 100],
  links: () => [] as PaginationLink[],
})

const emit = defineEmits<{
  'change:page': [page: number]
  'change:pageSize': [size: number]
}>()

const canPrev = computed(() => props.currentPage > 1)
const canNext = computed(() => props.currentPage < props.totalPages)

function goFirst() { if (props.currentPage > 1) emit('change:page', 1) }
function goPrev() { if (canPrev.value) emit('change:page', props.currentPage - 1) }
function goNext() { if (canNext.value) emit('change:page', props.currentPage + 1) }
function goLast() { if (props.currentPage < props.totalPages) emit('change:page', props.totalPages) }
function onChangePageSize(value: string) { emit('change:pageSize', Number(value)) }
function isNumericLabel(label: string) { return /^\d+$/.test(label) }
</script>

<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
    <div class="flex flex-col gap-2 text-sm text-muted-foreground lg:flex-row lg:items-center">
      <span>
        แสดง {{ (from ?? 0).toLocaleString() }} - {{ (to ?? 0).toLocaleString() }}
        จาก {{ total.toLocaleString() }} รายการ
      </span>
    </div>

    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-muted-foreground whitespace-nowrap">แสดงต่อหน้า:</span>
        <Select :model-value="pageSize.toString()" @update:model-value="onChangePageSize">
          <SelectTrigger class="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="size in (pageSizeOptions || [])" :key="size" :value="size.toString()">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!canPrev" @click="goFirst">
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!canPrev" @click="goPrev">
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <template v-for="(link, i) in links" :key="i">
          <Button
            v-if="isNumericLabel(link.label)"
            :variant="link.active ? 'default' : 'outline'"
            size="sm"
            :disabled="!link.url"
            @click="() => $emit('change:page', Number(link.label))"
          >
            {{ link.label }}
          </Button>
        </template>

        <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!canNext" @click="goNext">
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!canNext" @click="goLast">
          <ChevronsRight class="h-4 w-4" />
        </Button>

        <div class="flex items-center gap-1 px-2">
          <span class="text-sm font-medium">หน้า {{ currentPage }} จาก {{ totalPages }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
