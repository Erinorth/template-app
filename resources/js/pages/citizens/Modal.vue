<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// ✅ นำเข้า Form Field Components
import { CitizenIdField, BirthDateField, RemarkField } from '@/components/custom/form-fields'
import type { Citizen } from './types'

/**
 * Props definition
 */
const props = defineProps<{
  open: boolean
  mode?: 'create' | 'edit'
  citizen?: Citizen | null
}>()

/**
 * Emits definition
 */
const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

/**
 * State สำหรับการ submit
 */
const isSubmitting = ref(false)

/**
 * Form state
 */
const form = useForm({
  citizen_id: '',
  birth_date: '',
  remark: '',
})

/**
 * ฟังก์ชัน format citizen ID สำหรับแสดงผล
 */
function formatCitizenId(value: string): string {
  if (!value) return ''
  
  const cleaned = String(value).replace(/\D/g, '')
  const limited = cleaned.substring(0, 13)

  if (limited.length <= 1) return limited
  if (limited.length <= 5)
    return `${limited.substring(0, 1)}-${limited.substring(1)}`
  if (limited.length <= 10)
    return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5)}`
  if (limited.length <= 12)
    return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10)}`

  return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10, 12)}-${limited.substring(12)}`
}

/**
 * ฟังก์ชันลบขีดและอักขระพิเศษ
 */
function cleanCitizenId(value: string): string {
  return String(value).replace(/\D/g, '')
}

/**
 * Computed properties
 */
const modalTitle = computed(() =>
  props.mode === 'edit' ? 'แก้ไขข้อมูลประชาชน' : 'เพิ่มข้อมูลประชาชน'
)

const modalDescription = computed(() =>
  props.mode === 'edit'
    ? 'แก้ไขข้อมูลประชาชนในระบบ'
    : 'เพิ่มข้อมูลประชาชนใหม่เข้าสู่ระบบ'
)

const submitButtonText = computed(() => {
  if (isSubmitting.value) return 'กำลังบันทึก...'
  return props.mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'
})

/**
 * ฟังก์ชันโหลดข้อมูล
 */
function loadCitizenData(citizen: Citizen) {
  console.log('📥 Loading citizen data:', citizen)

  form.citizen_id = citizen.citizen_id ? formatCitizenId(citizen.citizen_id) : ''
  form.birth_date = citizen.birth_date ?? ''
  form.remark = citizen.remark ?? ''

  form.clearErrors()

  console.log('✅ Form loaded:', {
    citizen_id: form.citizen_id,
    birth_date: form.birth_date,
    remark: form.remark,
  })
}

/**
 * Watch modal state
 */
watch(
  () => ({ open: props.open, citizen: props.citizen, mode: props.mode }),
  ({ open, citizen, mode }) => {
    console.log('👁️ Modal state:', { open, mode, citizenId: citizen?.id })

    if (open) {
      if (mode === 'edit' && citizen) {
        console.log('✏️ Edit mode')
        loadCitizenData(citizen)
      } else if (mode === 'create') {
        console.log('➕ Create mode')
        form.reset()
        form.clearErrors()
      }
    } else {
      form.reset()
      form.clearErrors()
    }
  },
  { immediate: true }
)

/**
 * Submit form
 */
function submitForm() {
  // เตรียมข้อมูลสำหรับส่ง
  const submitData = {
    citizen_id: cleanCitizenId(form.citizen_id),
    birth_date: form.birth_date,
    remark: form.remark,
  }

  console.log('📤 Submitting (cleaned):', submitData)
  isSubmitting.value = true

  const isEditMode = props.mode === 'edit'
  const submitRoute = isEditMode
    ? route('citizens.update', props.citizen!.id)
    : route('citizens.store')
  const submitMethod = isEditMode ? 'put' : 'post'

  form.transform(() => submitData)[submitMethod](submitRoute, {
    preserveScroll: true,
    onSuccess: () => {
      toast.success(
        isEditMode ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ'
      )
      emit('success')
      emit('update:open', false)
    },
    onError: (errors) => {
      console.error('❌ Errors:', errors)
      toast.error('เกิดข้อผิดพลาด กรุณาตรวจสอบข้อมูล')
    },
    onFinish: () => {
      isSubmitting.value = false
    },
  })
}

function cancelForm() {
  emit('update:open', false)
}

function handleOpenChange(open: boolean) {
  emit('update:open', open)
}

console.log('🚀 CitizenModal initialized')
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ modalTitle }}</DialogTitle>
        <DialogDescription>{{ modalDescription }}</DialogDescription>
      </DialogHeader>

      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- ✅ ใช้ CitizenIdField Component -->
        <CitizenIdField
          v-model="form.citizen_id"
          :error="form.errors.citizen_id"
          :disabled="isSubmitting"
        />

        <!-- ✅ ใช้ BirthDateField Component -->
        <BirthDateField
          v-model="form.birth_date"
          :error="form.errors.birth_date"
          :disabled="isSubmitting"
        />

        <!-- ✅ ใช้ RemarkField Component -->
        <RemarkField
          v-model="form.remark"
          :error="form.errors.remark"
          :disabled="isSubmitting"
          :rows="3"
          placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
        />

        <DialogFooter class="gap-3 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            @click="cancelForm"
            :disabled="isSubmitting"
          >
            ยกเลิก
          </Button>
          <Button type="submit" :disabled="isSubmitting">
            {{ submitButtonText }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
