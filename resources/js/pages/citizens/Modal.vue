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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-vue-next'
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

// State สำหรับการ submit
const isSubmitting = ref(false)

// ✅ ใช้ snake_case ให้ตรงกับ database
const form = useForm({
  citizen_id: '',
  birth_date: '',
  remark: '',
})

// ฟังก์ชัน format citizen ID สำหรับแสดงผล (มีขีด)
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

// ✅ ฟังก์ชันลบขีดและอักขระพิเศษ เหลือเฉพาะตัวเลข
function cleanCitizenId(value: string): string {
  return String(value).replace(/\D/g, '')
}

// ตรวจสอบ citizen ID ด้วย checksum
const isCitizenIdValid = computed(() => {
  const cleaned = cleanCitizenId(form.citizen_id)
  if (cleaned.length !== 13) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * (13 - i)
  }
  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === parseInt(cleaned[12])
})

// Computed ข้อความแจ้งเตือน
const citizenIdValidationMessage = computed(() => {
  if (!form.citizen_id) return ''
  const cleaned = cleanCitizenId(form.citizen_id)
  if (cleaned.length === 0 || cleaned.length === 13) return ''
  if (cleaned.length < 13) return `กรุณากรอกให้ครบ 13 หลัก (ป้อนแล้ว ${cleaned.length} หลัก)`
  if (cleaned.length === 13 && !isCitizenIdValid.value)
    return 'เลขบัตรประชาชนไม่ถูกต้อง'
  return ''
})

const birthDateValidationMessage = computed(() => {
  if (!form.birth_date) return ''

  const birthDate = new Date(form.birth_date)
  const today = new Date()

  if (birthDate > today) return 'วันเกิดต้องไม่เกินวันปัจจุบัน'

  const year1900 = new Date('1900-01-01')
  if (birthDate < year1900) return 'กรุณาระบุวันเกิดหลังปี ค.ศ. 1900'

  const age = Math.floor(
    (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )
  if (age > 150) return 'อายุไม่สมเหตุสมผล (มากกว่า 150 ปี)'

  return ''
})

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

// ✅ ฟังก์ชันโหลดข้อมูล
function loadCitizenData(citizen: Citizen) {
  console.log('📥 Loading citizen data:', citizen)

  // กำหนดค่าโดยตรง - แสดง citizen_id แบบมีขีด
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

// Watch modal state
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

// Handle input
function handleCitizenIdInput(event: Event) {
  const input = event.target as HTMLInputElement
  form.citizen_id = formatCitizenId(input.value)
}

// ✅ Submit form - ลบขีดออกก่อนส่ง
function submitForm() {
  // เตรียมข้อมูลสำหรับส่ง - ลบขีดออกจาก citizen_id
  const submitData = {
    citizen_id: cleanCitizenId(form.citizen_id), // ✅ ส่งเฉพาะตัวเลข 13 หลัก
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

  // ✅ ใช้ form.transform() เพื่อแปลงข้อมูลก่อนส่ง
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
        <!-- Citizen ID Field -->
        <div class="space-y-2">
          <Label for="citizen_id">
            เลขบัตรประชาชน <span class="text-red-500">*</span>
          </Label>
          <Input
            id="citizen_id"
            v-model="form.citizen_id"
            type="text"
            placeholder="X-XXXX-XXXXX-XX-X"
            maxlength="17"
            @input="handleCitizenIdInput"
            :class="{ 'border-red-500': form.errors.citizen_id }"
            required
            :disabled="isSubmitting"
          />
          <p
            v-if="form.errors.citizen_id"
            class="text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle class="h-4 w-4" />
            {{ form.errors.citizen_id }}
          </p>
          <p
            v-else-if="citizenIdValidationMessage"
            :class="[
              'text-sm flex items-center gap-1',
              !isCitizenIdValid &&
              form.citizen_id.replace(/\D/g, '').length === 13
                ? 'text-red-500'
                : 'text-muted-foreground',
            ]"
          >
            <AlertCircle
              v-if="
                !isCitizenIdValid &&
                form.citizen_id.replace(/\D/g, '').length === 13
              "
              class="h-4 w-4"
            />
            {{ citizenIdValidationMessage }}
          </p>
          <p v-else class="text-xs text-muted-foreground">
            กรุณากรอกเลขบัตรประชาชน 13 หลัก
          </p>
        </div>

        <!-- Birth Date Field -->
        <div class="space-y-2">
          <Label for="birth_date">วันเกิด</Label>
          <Input
            id="birth_date"
            v-model="form.birth_date"
            type="date"
            :max="new Date().toISOString().split('T')[0]"
            :class="{
              'border-red-500':
                form.errors.birth_date ||
                (form.birth_date && birthDateValidationMessage.includes('ไม่')),
            }"
            :disabled="isSubmitting"
          />
          <p
            v-if="form.errors.birth_date"
            class="text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle class="h-4 w-4" />
            {{ form.errors.birth_date }}
          </p>
          <p
            v-else-if="birthDateValidationMessage"
            :class="[
              'text-sm',
              birthDateValidationMessage.includes('ไม่')
                ? 'text-red-500'
                : 'text-muted-foreground',
            ]"
          >
            {{ birthDateValidationMessage }}
          </p>
        </div>

        <!-- Remark Field -->
        <div class="space-y-2">
          <Label for="remark">หมายเหตุ</Label>
          <Textarea
            id="remark"
            v-model="form.remark"
            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
            rows="3"
            :class="{ 'border-red-500': form.errors.remark }"
            :disabled="isSubmitting"
          />
          <p v-if="form.errors.remark" class="text-sm text-red-500">
            {{ form.errors.remark }}
          </p>
        </div>

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
