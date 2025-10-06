<script setup lang="ts">
import { ref } from 'vue'
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

/**
 * Props definition
 * กำหนด props ที่ component รับเข้ามา
 */
const props = defineProps<{
  open: boolean // สถานะการเปิด/ปิด modal
}>()

/**
 * Emits definition
 * กำหนด events ที่ component จะ emit ออกไป
 */
const emit = defineEmits<{
  'update:open': [value: boolean] // event สำหรับอัปเดตสถานะ open
  'success': [] // event เมื่อบันทึกข้อมูลสำเร็จ
}>()

/**
 * State สำหรับควบคุมการ submit
 */
const isSubmitting = ref(false)

/**
 * สร้าง form สำหรับการเพิ่มข้อมูลแบบด่วน
 * ใช้ useForm จาก Inertia สำหรับจัดการ form state และ validation
 */
const quickForm = useForm({
  citizen_id: '',
  birth_date: '',
  remark: '',
})

/**
 * ฟังก์ชัน format citizen ID
 * จัดรูปแบบเลขประจำตัวประชาชนให้มีขีดกลาง
 * รูปแบบ: X-XXXX-XXXXX-XX-X
 */
function formatCitizenId(value: string): string {
  // ลบทุกอักขระที่ไม่ใช่ตัวเลข
  const cleaned = value.replace(/\D/g, '')
  
  // จำกัดความยาวไม่เกิน 13 ตัว
  const limited = cleaned.substring(0, 13)
  
  // จัดรูปแบบตามความยาวของตัวเลข
  if (limited.length <= 1) return limited
  if (limited.length <= 5) return `${limited.substring(0, 1)}-${limited.substring(1)}`
  if (limited.length <= 10) return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5)}`
  if (limited.length <= 12) return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10)}`
  
  return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10, 12)}-${limited.substring(12)}`
}

/**
 * ฟังก์ชัน handle citizen ID input
 * จัดการการกรอกเลขประจำตัวประชาชน
 * ทำการ format อัตโนมัติขณะพิมพ์
 */
function handleCitizenIdInput(event: Event) {
  const input = event.target as HTMLInputElement
  const formatted = formatCitizenId(input.value)
  quickForm.citizen_id = formatted
  
  console.log('Citizen ID formatted:', { original: input.value, formatted })
}

/**
 * ฟังก์ชัน submit quick create form
 * ส่งข้อมูลการเพิ่มแบบด่วนไปยัง server
 */
function submitQuickCreate() {
  console.log('CitizenQuickCreateModal: Submitting form', quickForm.data())
  
  isSubmitting.value = true
  
  // ส่งข้อมูลไปยัง server ผ่าน Inertia
  quickForm.post(route('citizens.store'), {
    preserveScroll: true,
    preserveState: true,
    onSuccess: () => {
      console.log('CitizenQuickCreateModal: Citizen created successfully')
      toast.success('เพิ่มข้อมูลประชาชนเรียบร้อยแล้ว')
      
      // ปิด modal
      emit('update:open', false)
      
      // Emit success event
      emit('success')
      
      // Reset form
      quickForm.reset()
      
      isSubmitting.value = false
    },
    onError: (errors) => {
      console.error('CitizenQuickCreateModal: Validation errors', errors)
      toast.error('กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง')
      
      isSubmitting.value = false
    },
    onFinish: () => {
      isSubmitting.value = false
    }
  })
}

/**
 * ฟังก์ชัน cancel quick create
 * ยกเลิกการเพิ่มข้อมูลและปิด modal
 */
function cancelQuickCreate() {
  console.log('CitizenQuickCreateModal: Canceling')
  
  // ปิด modal
  emit('update:open', false)
  
  // Reset form
  quickForm.reset()
  quickForm.clearErrors()
}

/**
 * ฟังก์ชัน handle modal open change
 * จัดการเมื่อสถานะ modal เปลี่ยน
 */
function handleOpenChange(open: boolean) {
  console.log('CitizenQuickCreateModal: Open state changed', open)
  
  // ถ้า modal ถูกปิด ให้ reset form
  if (!open) {
    quickForm.reset()
    quickForm.clearErrors()
  }
  
  // Emit update:open event
  emit('update:open', open)
}

// Log เมื่อ component ถูก mount
console.log('CitizenQuickCreateModal: Component initialized')
</script>

<template>
  <!-- Quick Create Modal -->
  <Dialog :open="props.open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>เพิ่มข้อมูลประชาชนแบบด่วน</DialogTitle>
        <DialogDescription>
          กรอกข้อมูลพื้นฐานเพื่อเพิ่มข้อมูลประชาชนเข้าสู่ระบบ
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="submitQuickCreate" class="space-y-4">
        <!-- Citizen ID Field -->
        <div class="space-y-2">
          <label 
            for="citizen_id" 
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            เลขประจำตัวประชาชน <span class="text-red-500">*</span>
          </label>
          <Input
            id="citizen_id"
            v-model="quickForm.citizen_id"
            type="text"
            placeholder="X-XXXX-XXXXX-XX-X"
            maxlength="17"
            @input="handleCitizenIdInput"
            :class="{ 'border-red-500': quickForm.errors.citizen_id }"
            required
            :disabled="isSubmitting"
          />
          <p v-if="quickForm.errors.citizen_id" class="text-sm text-red-500">
            {{ quickForm.errors.citizen_id }}
          </p>
          <p class="text-xs text-muted-foreground">
            กรอกเลขประจำตัวประชาชน 13 หลัก
          </p>
        </div>

        <!-- Birth Date Field -->
        <div class="space-y-2">
          <label 
            for="birth_date" 
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            วันเกิด
          </label>
          <Input
            id="birth_date"
            v-model="quickForm.birth_date"
            type="date"
            :class="{ 'border-red-500': quickForm.errors.birth_date }"
            :disabled="isSubmitting"
          />
          <p v-if="quickForm.errors.birth_date" class="text-sm text-red-500">
            {{ quickForm.errors.birth_date }}
          </p>
        </div>

        <!-- Remark Field -->
        <div class="space-y-2">
          <label 
            for="remark" 
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            หมายเหตุ
          </label>
          <Textarea
            id="remark"
            v-model="quickForm.remark"
            placeholder="กรอกหมายเหตุเพิ่มเติม (ถ้ามี)"
            rows="3"
            :class="{ 'border-red-500': quickForm.errors.remark }"
            :disabled="isSubmitting"
          />
          <p v-if="quickForm.errors.remark" class="text-sm text-red-500">
            {{ quickForm.errors.remark }}
          </p>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            @click="cancelQuickCreate"
            :disabled="isSubmitting"
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">กำลังบันทึก...</span>
            <span v-else>บันทึก</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
