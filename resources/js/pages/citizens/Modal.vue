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
// นำเข้าฟังก์ชันจาก utils
import { formatThaiCitizenId } from '@/lib/utils'

// Form Field Components
import { CitizenIdField, BirthDateField, RemarkField } from '@/components/custom/form-fields'

import type { Citizen } from './types'

// Props definition
const props = defineProps<{
  open: boolean
  mode?: 'create' | 'edit'
  citizen?: Citizen | null
}>()

// Emits definition
const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

// State สำหรับ submit
const isSubmitting = ref(false)

// Form state - ใช้ snake_case
const form = useForm({
  citizen_id: '',
  birth_date: '',
  remark: '',
})

// ฟังก์ชันลบอักขระที่ไม่ใช่ตัวเลข
function cleanCitizenId(value: string): string {
  return String(value).replace(/\D/g, '')
}

// Computed properties
const modalTitle = computed(() => {
  return props.mode === 'edit' ? 'แก้ไขข้อมูลประชาชน' : 'เพิ่มข้อมูลประชาชน'
})

const modalDescription = computed(() => {
  return props.mode === 'edit'
    ? 'แก้ไขข้อมูลประชาชนที่มีอยู่ในระบบ'
    : 'เพิ่มข้อมูลประชาชนใหม่ในระบบ'
})

const submitButtonText = computed(() => {
  if (isSubmitting.value) return 'กำลังบันทึก...'
  return props.mode === 'edit' ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล'
})

// ฟังก์ชันโหลดข้อมูล citizen เข้าฟอร์ม
function loadCitizenData(citizen: Citizen) {
  console.log('Loading citizen data', citizen)
  // ใช้ formatThaiCitizenId จาก utils และ snake_case
  form.citizen_id = citizen.citizen_id ? formatThaiCitizenId(citizen.citizen_id) : ''
  form.birth_date = citizen.birth_date ?? ''
  form.remark = citizen.remark ?? ''
  form.clearErrors()

  console.log('Form loaded', {
    citizen_id: form.citizen_id,
    birth_date: form.birth_date,
    remark: form.remark,
  })
}

// Watch modal state
watch(
  [() => props.open, () => props.citizen, () => props.mode],
  ([open, citizen, mode]) => {
    console.log('Modal state', { open, mode, citizenId: citizen?.id })

    if (open) {
      if (mode === 'edit' && citizen) {
        console.log('Edit mode')
        loadCitizenData(citizen)
      } else if (mode === 'create') {
        console.log('Create mode')
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

// Submit form
function submitForm() {
  // เตรียมข้อมูลด้วย snake_case
  const submitData = {
    citizen_id: cleanCitizenId(form.citizen_id),
    birth_date: form.birth_date,
    remark: form.remark,
  }

  console.log('Submitting (cleaned)', submitData)

  isSubmitting.value = true

  const isEditMode = props.mode === 'edit'
  const submitRoute = isEditMode
    ? route('citizens.update', props.citizen!.id)
    : route('citizens.store')
  const submitMethod = isEditMode ? 'put' : 'post'

  form.transform(() => submitData)[submitMethod](submitRoute, {
    preserveScroll: true,
    onSuccess: () => {
      console.log(`CitizenModal: ${isEditMode ? 'Updated' : 'Created'} successfully`)
      toast.success(isEditMode ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ')
      emit('success')
      emit('update:open', false)
      form.reset()
    },
    onError: (errors) => {
      console.error('CitizenModal: Validation errors', errors)
      toast.error('เกิดข้อผิดพลาด')
    },
    onFinish: () => {
      isSubmitting.value = false
    },
  })
}

// ยกเลิกฟอร์ม
function cancelForm() {
  emit('update:open', false)
}

// Handle dialog open change
function handleOpenChange(open: boolean) {
  emit('update:open', open)
}

console.log('CitizenModal initialized')
</script>

<template>
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>{{ modalTitle }}</DialogTitle>
        <DialogDescription>{{ modalDescription }}</DialogDescription>
      </DialogHeader>

      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- CitizenIdField Component - bind กับ form.citizen_id -->
        <CitizenIdField
          v-model="form.citizen_id"
          :error="form.errors.citizen_id"
          :disabled="isSubmitting"
        />

        <!-- BirthDateField Component - bind กับ form.birth_date -->
        <BirthDateField
          v-model="form.birth_date"
          :error="form.errors.birth_date"
          :disabled="isSubmitting"
        />

        <!-- RemarkField Component -->
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
