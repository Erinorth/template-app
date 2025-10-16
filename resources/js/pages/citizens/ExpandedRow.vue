<script setup lang="ts">
import { computed } from 'vue'
import type { Citizen } from './types'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, FileText, Clock, User, AlertCircle } from 'lucide-vue-next'
import { formatThaiCitizenId } from '@/lib/utils'

/**
 * Props definition
 * รับข้อมูล citizen ที่จะแสดง
 */
const props = defineProps<{
  citizen: Citizen
}>()

/**
 * จัดรูปแบบวันที่เป็นภาษาไทย
 */
const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-'
  try {
    const dateObj = new Date(date)
    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return '-'
  }
}

/**
 * จัดรูปแบบวันที่และเวลาเป็นภาษาไทย
 */
const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return '-'
  try {
    const dateObj = new Date(date)
    return dateObj.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

/**
 * คำนวณอายุจากวันเกิด
 */
const calculateAge = computed(() => {
  if (!props.citizen.birth_date) return null

  try {
    const birthDate = new Date(props.citizen.birth_date)
    const today = new Date()
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))

    return age > 0 ? `${age} ปี` : null
  } catch {
    return null
  }
})

/**
 * จัดรูปแบบเลขบัตรประชาชน
 */
const formattedCitizenId = computed(() => {
  if (!props.citizen.citizen_id) return '-'
  return formatThaiCitizenId(props.citizen.citizen_id)
})

/**
 * ตรวจสอบว่ามีหมายเหตุหรือไม่
 */
const hasRemark = computed(() => {
  return !!props.citizen.remark && props.citizen.remark.trim().length > 0
})

// Log สำหรับการ debug
console.log('[CitizenExpandedRow] Component initialized', {
  citizenId: props.citizen.id,
  hasRemark: hasRemark.value
})
</script>

<template>
  <div class="p-4 bg-muted/30 rounded-lg border border-border">
    <!-- Grid Layout สำหรับ Responsive -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- ข้อมูลหลัก -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 text-sm font-semibold text-primary">
          <User class="h-4 w-4" />
          <span>ข้อมูลหลัก</span>
        </div>

        <!-- ID -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span>ID</span>
          </div>
          <Badge variant="secondary" class="font-mono">
            {{ String(props.citizen.id).padStart(6, '0') }}
          </Badge>
        </div>

        <!-- เลขบัตรประชาชน -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText class="h-3 w-3" />
            <span>เลขบัตรประชาชน</span>
          </div>
          <p class="text-sm font-mono font-semibold">
            {{ formattedCitizenId }}
          </p>
        </div>

        <!-- วันเกิด -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar class="h-3 w-3" />
            <span>วันเกิด</span>
          </div>
          <div class="flex items-center gap-2">
            <p class="text-sm font-medium">
              {{ formatDate(props.citizen.birth_date) }}
            </p>
            <Badge v-if="calculateAge" variant="outline" class="text-xs">
              {{ calculateAge }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- ข้อมูลเพิ่มเติม -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 text-sm font-semibold text-primary">
          <Clock class="h-4 w-4" />
          <span>ข้อมูลเพิ่มเติม</span>
        </div>

        <!-- หมายเหตุ -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle class="h-3 w-3" />
            <span>หมายเหตุ</span>
          </div>
          <div v-if="hasRemark" class="p-2 bg-background rounded border text-xs">
            <p class="whitespace-pre-wrap break-words">
              {{ props.citizen.remark }}
            </p>
          </div>
          <p v-else class="text-xs text-muted-foreground italic">
            ไม่มีหมายเหตุ
          </p>
        </div>

        <Separator />

        <!-- ข้อมูลระบบ -->
        <div class="space-y-2">
          <!-- วันที่สร้าง -->
          <div class="flex justify-between items-start text-xs">
            <span class="text-muted-foreground">สร้างเมื่อ:</span>
            <span class="font-medium text-right">
              {{ formatDateTime(props.citizen.created_at) }}
            </span>
          </div>

          <!-- วันที่แก้ไขล่าสุด -->
          <div class="flex justify-between items-start text-xs">
            <span class="text-muted-foreground">แก้ไขล่าสุด:</span>
            <span class="font-medium text-right">
              {{ formatDateTime(props.citizen.updated_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
