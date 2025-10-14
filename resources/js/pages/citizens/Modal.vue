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

// Props definition - รับค่าจาก component
const props = defineProps<{
  open: boolean // สถานะเปิด/ปิด modal
  mode?: 'create' | 'edit' // โหมดการใช้งาน (สร้างใหม่หรือแก้ไข)
  citizen?: Citizen | null // ข้อมูล citizen สำหรับการแก้ไข
}>()

// Emits definition - กำหนด events ที่ emit ออกไป
const emit = defineEmits<{
  'update:open': [value: boolean] // อัพเดทสถานะ modal
  success: [] // เมื่อบันทึกสำเร็จ
}>()

// State สำหรับการ submit
const isSubmitting = ref(false)

// สร้าง form โดยใช้ Inertia useForm
const form = useForm({
  citizenid: '',
  birthdate: '',
  remark: '',
})

// ฟังก์ชันสำหรับ format citizen ID ให้เป็นรูปแบบ X-XXXX-XXXXX-XX-X
function formatCitizenId(value: string): string {
  // ลบตัวอักษรที่ไม่ใช่ตัวเลขออก และจำกัดที่ 13 ตัว
  const cleaned = value.replace(/\D/g, '')
  const limited = cleaned.substring(0, 13)

  // Format ตามความยาว
  if (limited.length <= 1) return limited
  if (limited.length <= 5)
    return `${limited.substring(0, 1)}-${limited.substring(1)}`
  if (limited.length <= 10)
    return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5)}`
  if (limited.length <= 12)
    return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10)}`

  return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10, 12)}-${limited.substring(12)}`
}

// ฟังก์ชันตรวจสอบความถูกต้องของ citizen ID
const isCitizenIdValid = computed(() => {
  const cleaned = form.citizenid.replace(/\D/g, '')
  if (cleaned.length !== 13) return false

  // ตรวจสอบ checksum digit
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * (13 - i)
  }
  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === parseInt(cleaned[12])
})

// Computed สำหรับข้อความแจ้งเตือนการตรวจสอบ citizen ID
const citizenIdValidationMessage = computed(() => {
  if (!form.citizenid) return ''
  const cleaned = form.citizenid.replace(/\D/g, '')

  if (cleaned.length === 0 || cleaned.length === 13) return ''
  if (cleaned.length < 13) return 'กรุณากรอกเลขบัตรประชาชน 13 หลัก'
  if (cleaned.length === 13 && !isCitizenIdValid.value)
    return 'เลขบัตรประชาชนไม่ถูกต้อง'

  return ''
})

// Computed สำหรับข้อความแจ้งเตือนวันเกิด
const birthDateValidationMessage = computed(() => {
  if (!form.birthdate) return ''

  const birthDate = new Date(form.birthdate)
  const today = new Date()

  // ตรวจสอบวันเกิดต้องไม่เกินวันปัจจุบัน
  if (birthDate > today) return 'วันเกิดต้องไม่เกินวันปัจจุบัน'

  // ตรวจสอบอายุต้องไม่เกิน 150 ปี
  const year1900 = new Date('1900-01-01')
  if (birthDate < year1900) return 'วันเกิดต้องไม่ต่ำกว่าปี ค.ศ. 1900'

  // คำนวณอายุ
  const age = Math.floor(
    (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )
  if (age > 150) return 'อายุต้องไม่เกิน 150 ปี'

  return ''
})

// Computed สำหรับชื่อหัวข้อ modal ตามโหมด
const modalTitle = computed(() => {
  return props.mode === 'edit' ? 'แก้ไขข้อมูลประชากร' : 'เพิ่มข้อมูลประชากรแบบด่วน'
})

// Computed สำหรับคำอธิบาย modal ตามโหมด
const modalDescription = computed(() => {
  return props.mode === 'edit'
    ? 'แก้ไขข้อมูลประชากรที่ต้องการเปลี่ยนแปลง'
    : 'กรอกข้อมูลประชากรเบื้องต้นเพื่อสร้างรายการใหม่อย่างรวดเร็ว'
})

// Computed สำหรับข้อความปุ่มบันทึก
const submitButtonText = computed(() => {
  if (isSubmitting.value) return 'กำลังบันทึก...'
  return props.mode === 'edit' ? 'บันทึกการแก้ไข' : 'สร้างรายการ'
})

// Watch เมื่อ modal เปิดและมีข้อมูล citizen (สำหรับโหมด edit)
watch(
  () => ({ open: props.open, citizen: props.citizen, mode: props.mode }),
  (newValue) => {
    // แยกการตรวจสอบ type ให้ชัดเจน
    const { open, citizen, mode } = newValue
    
    if (open && mode === 'edit' && citizen) {
      // โหมด edit: โหลดข้อมูลเดิมเข้า form
      form.citizenid = citizen.citizenid || ''
      form.birthdate = citizen.birthdate || ''
      form.remark = citizen.remark || ''

      console.log('CitizenModal: Loaded data for edit', {
        id: citizen.id,
        citizenid: citizen.citizenid,
        mode,
      })
    } else if (open && mode === 'create') {
      // โหมด create: เคลียร์ form
      form.reset()
      form.clearErrors()

      console.log('CitizenModal: Initialized for create mode')
    }
  },
  { immediate: true }
)

// Watch เมื่อ modal ปิด ให้ reset form
watch(
  () => props.open,
  (open) => {
    if (!open) {
      form.reset()
      form.clearErrors()
    }
  }
)

// Handle citizen ID input และ format
function handleCitizenIdInput(event: Event) {
  const input = event.target as HTMLInputElement
  const formatted = formatCitizenId(input.value)
  form.citizenid = formatted

  console.log('Citizen ID formatted', {
    original: input.value,
    formatted,
  })
}

// Submit form ไปยัง server
function submitForm() {
  console.log('CitizenModal: Submitting form', {
    mode: props.mode,
    data: form.data(),
    citizenId: props.citizen?.id,
  })

  isSubmitting.value = true

  // กำหนด route และ method ตามโหมด
  const isEditMode = props.mode === 'edit'
  const submitRoute = isEditMode
    ? route('citizens.update', props.citizen!.id)
    : route('citizens.store')

  // ใช้ put สำหรับ edit และ post สำหรับ create
  const submitMethod = isEditMode ? 'put' : 'post'

  // Submit form ด้วย Inertia
  form[submitMethod](submitRoute, {
    preserveScroll: true,
    preserveState: true,
    onSuccess: () => {
      console.log('CitizenModal: Form submitted successfully', {
        mode: props.mode,
      })

      // แสดง toast ตามโหมด
      toast.success(
        isEditMode ? 'แก้ไขข้อมูลประชากรสำเร็จ' : 'เพิ่มข้อมูลประชากรสำเร็จ'
      )

      // ปิด modal
      emit('update:open', false)

      // Emit success event
      emit('success')

      // Reset form
      form.reset()
      isSubmitting.value = false
    },
    onError: (errors) => {
      console.error('CitizenModal: Validation errors', errors)
      toast.error('กรุณาตรวจสอบข้อมูลที่กรอก')
      isSubmitting.value = false
    },
    onFinish: () => {
      isSubmitting.value = false
    },
  })
}

// Cancel และปิด modal
function cancelForm() {
  console.log('CitizenModal: Canceling', { mode: props.mode })
  emit('update:open', false)

  // Reset form
  form.reset()
  form.clearErrors()
}

// Handle modal open/close change
function handleOpenChange(open: boolean) {
  console.log('CitizenModal: Open state changed', { open })

  // ถ้าปิด modal ให้ reset form
  if (!open) {
    form.reset()
    form.clearErrors()
  }

  // Emit update:open event
  emit('update:open', open)
}

// Log component mount
console.log('CitizenModal: Component initialized')
</script>

<template>
  <!-- Modal Component -->
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[500px]">
      <!-- Modal Header -->
      <DialogHeader>
        <DialogTitle>{{ modalTitle }}</DialogTitle>
        <DialogDescription>{{ modalDescription }}</DialogDescription>
      </DialogHeader>

      <!-- Form Content -->
      <form @submit.prevent="submitForm" class="space-y-4">
        <!-- Citizen ID Field -->
        <div class="space-y-2">
          <Label for="citizenid">
            เลขบัตรประชาชน
            <span class="text-red-500">*</span>
          </Label>
          <Input
            id="citizenid"
            v-model="form.citizenid"
            type="text"
            placeholder="X-XXXX-XXXXX-XX-X"
            maxlength="17"
            @input="handleCitizenIdInput"
            :class="{
              'border-red-500': form.errors.citizenid,
            }"
            required
            :disabled="isSubmitting"
          />
          <!-- Validation Messages -->
          <p
            v-if="form.errors.citizenid"
            class="text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle class="h-4 w-4" />
            {{ form.errors.citizenid }}
          </p>
          <p
            v-else-if="citizenIdValidationMessage"
            :class="[
              'text-sm flex items-center gap-1',
              !isCitizenIdValid &&
              form.citizenid.replace(/\D/g, '').length === 13
                ? 'text-red-500'
                : 'text-muted-foreground',
            ]"
          >
            <AlertCircle
              v-if="
                !isCitizenIdValid &&
                form.citizenid.replace(/\D/g, '').length === 13
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
          <Label for="birthdate">วันเกิด</Label>
          <Input
            id="birthdate"
            v-model="form.birthdate"
            type="date"
            :max="new Date().toISOString().split('T')[0]"
            :class="{
              'border-red-500':
                form.errors.birthdate ||
                (form.birthdate && birthDateValidationMessage.includes('ต้อง')),
            }"
            :disabled="isSubmitting"
          />
          <!-- Validation Messages -->
          <p
            v-if="form.errors.birthdate"
            class="text-sm text-red-500 flex items-center gap-1"
          >
            <AlertCircle class="h-4 w-4" />
            {{ form.errors.birthdate }}
          </p>
          <p
            v-else-if="birthDateValidationMessage"
            :class="[
              'text-sm',
              birthDateValidationMessage.includes('ต้อง')
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
            placeholder="เพิ่มหมายเหตุหรือข้อมูลเพิ่มเติม (ถ้ามี)"
            :rows="3"
            :class="{
              'border-red-500': form.errors.remark,
            }"
            :disabled="isSubmitting"
          />
          <p v-if="form.errors.remark" class="text-sm text-red-500">
            {{ form.errors.remark }}
          </p>
        </div>

        <!-- Modal Footer with Actions -->
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
