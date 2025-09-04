<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Props {
  status: string
  // เพิ่มตัวเลือกให้ส่ง mapping/สี/label จากภายนอก เพื่อไม่ผูกโดเมน
  labels?: Record<string, string>
  colors?: Record<string, string>
  variantMap?: Record<string, 'default' | 'destructive' | 'secondary'>
}

const props = withDefaults(defineProps<Props>(), {
  labels: () => ({
    pending: 'รอดำเนินการ',
    processing: 'กำลังประมวลผล',
    success: 'สำเร็จ',
    failed: 'ล้มเหลว',
  }),
  colors: () => ({
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    processing: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    success: 'bg-green-100 text-green-800 hover:bg-green-100',
    failed: 'bg-red-100 text-red-800 hover:bg-red-100',
  }),
  variantMap: () => ({
    pending: 'secondary',
    processing: 'default',
    success: 'default',
    failed: 'destructive',
  }),
})
</script>

<template>
  <Badge :variant="props.variantMap[props.status] || 'secondary'"
         :class="cn('capitalize', props.colors[props.status])">
    {{ props.labels[props.status] || props.status }}
  </Badge>
</template>
