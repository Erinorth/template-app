<script setup lang="ts">
import { ref, computed } from 'vue'
import { useForm, Head } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { type BreadcrumbItem } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Save, X, ArrowLeft } from 'lucide-vue-next'


/**
 * Define props สำหรับ component
 * รับ title จาก parent (ถ้ามี)
 */
const props = defineProps<{
  title?: string
}>()


/**
 * Breadcrumb items สำหรับ navigation
 */
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'หน้าหลัก', href: route('dashboard') },
  { title: 'ข้อมูลประชาชน', href: route('citizens.index') },
  { title: 'เพิ่มข้อมูลใหม่', href: route('citizens.create') }
]


/**
 * Form data และ validation
 * ใช้ useForm จาก Inertia สำหรับจัดการ form state
 */
const form = useForm({
  citizen_id: '',
  birth_date: '',
  remark: '',
})


/**
 * State สำหรับการ submit
 */
const isSubmitting = ref(false)


/**
 * ฟังก์ชัน format เลขประจำตัวประชาชน
 * จัดรูปแบบให้เป็น X-XXXX-XXXXX-XX-X
 */
function formatCitizenId(value: string): string {
  // ลบทุกอักขระที่ไม่ใช่ตัวเลข
  const cleaned = value.replace(/\D/g, '')
  
  // จำกัดความยาวไม่เกิน 13 ตัว
  const limited = cleaned.substring(0, 13)
  
  // จัดรูปแบบตามความยาว
  if (limited.length <= 1) return limited
  if (limited.length <= 5) return `${limited.substring(0, 1)}-${limited.substring(1)}`
  if (limited.length <= 10) return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5)}`
  if (limited.length <= 12) return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10)}`
  
  return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10, 12)}-${limited.substring(12)}`
}


/**
 * Handle citizen ID input
 * จัดการการกรอกเลขประจำตัวประชาชน
 */
function handleCitizenIdInput(event: Event) {
  const input = event.target as HTMLInputElement
  const formatted = formatCitizenId(input.value)
  form.citizen_id = formatted
  
  console.log('Citizen ID input:', { original: input.value, formatted })
}


/**
 * Validate citizen ID
 * ตรวจสอบความถูกต้องของเลขประจำตัวประชาชน
 */
const isCitizenIdValid = computed(() => {
  const cleaned = form.citizen_id.replace(/\D/g, '')
  
  if (cleaned.length !== 13) return false
  
  // คำนวณ checksum digit
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * (13 - i)
  }
  const checkDigit = (11 - (sum % 11)) % 10
  
  return checkDigit === parseInt(cleaned[12])
})


/**
 * Computed: แสดง validation message สำหรับ citizen ID
 */
const citizenIdValidationMessage = computed(() => {
  if (!form.citizen_id) return ''
  
  const cleaned = form.citizen_id.replace(/\D/g, '')
  
  if (cleaned.length > 0 && cleaned.length < 13) {
    return 'กรุณากรอกเลขประจำตัวประชาชนให้ครบ 13 หลัก'
  }
  
  if (cleaned.length === 13 && !isCitizenIdValid.value) {
    return 'เลขประจำตัวประชาชนไม่ถูกต้อง'
  }
  
  return ''
})


/**
 * Computed: แสดง validation message สำหรับวันเกิด
 */
const birthDateValidationMessage = computed(() => {
  if (!form.birth_date) return ''
  
  const birthDate = new Date(form.birth_date)
  const today = new Date()
  
  if (birthDate >= today) {
    return 'วันเกิดต้องเป็นวันที่ในอดีต'
  }
  
  const year1900 = new Date('1900-01-01')
  if (birthDate < year1900) {
    return 'วันเกิดต้องหลังปี ค.ศ. 1900'
  }
  
  // คำนวณอายุ
  const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  
  if (age > 150) {
    return 'วันเกิดไม่สมเหตุสมผล'
  }
  
  return `อายุ ${age} ปี`
})


/**
 * Computed: ตรวจสอบว่าฟอร์มสามารถ submit ได้หรือไม่
 */
const canSubmit = computed(() => {
  return form.citizen_id && 
         isCitizenIdValid.value && 
         !isSubmitting.value &&
         !citizenIdValidationMessage.value.includes('ไม่ถูกต้อง')
})


/**
 * Submit form
 * ส่งข้อมูลไปยัง server
 */
function submit() {
  // ตรวจสอบความถูกต้องก่อน submit
  if (!canSubmit.value) {
    toast.error('กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง')
    return
  }
  
  console.log('CitizenCreate: Submitting form', form.data())
  
  isSubmitting.value = true
  
  // ส่งข้อมูลผ่าน Inertia
  form.post(route('citizens.store'), {
    preserveScroll: true,
    onSuccess: () => {
      console.log('CitizenCreate: Form submitted successfully')
      toast.success('เพิ่มข้อมูลประชาชนเรียบร้อยแล้ว')
    },
    onError: (errors) => {
      console.error('CitizenCreate: Validation errors', errors)
      toast.error('กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง')
    },
    onFinish: () => {
      isSubmitting.value = false
    }
  })
}


/**
 * Cancel และกลับไปหน้า index
 */
function cancel() {
  console.log('CitizenCreate: Canceling form')
  
  // ถ้ามีการกรอกข้อมูล ให้แสดง confirmation
  if (form.isDirty) {
    if (confirm('คุณต้องการยกเลิกการเพิ่มข้อมูลหรือไม่? ข้อมูลที่กรอกจะไม่ถูกบันทึก')) {
      form.reset()
      window.history.back()
    }
  } else {
    window.history.back()
  }
}


// Log เมื่อ component ถูก mount
console.log('CitizenCreate: Component initialized')
</script>


<template>
  <!-- Head สำหรับ page title -->
  <Head :title="props.title ?? 'เพิ่มข้อมูลประชาชน'" />

  <!-- AppLayout แบบส่ง breadcrumbs เป็น prop -->
  <AppLayout :breadcrumbs="breadcrumbs">
    <!-- Main Content -->
    <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <!-- Page Header -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          เพิ่มข้อมูลประชาชน
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          กรอกข้อมูลเพื่อเพิ่มประชาชนเข้าสู่ระบบ
        </p>
      </div>

      <!-- Form Card -->
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลประชาชน</CardTitle>
          <CardDescription>
            กรอกข้อมูลพื้นฐานของประชาชน ฟิลด์ที่มีเครื่องหมาย * เป็นฟิลด์ที่จำเป็น
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="submit" class="space-y-6">
            <!-- Citizen ID Field -->
            <div class="space-y-2">
              <Label for="citizen_id">
                เลขประจำตัวประชาชน <span class="text-red-500">*</span>
              </Label>
              <Input
                id="citizen_id"
                v-model="form.citizen_id"
                type="text"
                placeholder="X-XXXX-XXXXX-XX-X"
                maxlength="17"
                autocomplete="off"
                @input="handleCitizenIdInput"
                :class="{ 
                  'border-red-500': form.errors.citizen_id || (form.citizen_id && !isCitizenIdValid),
                  'border-green-500': form.citizen_id && isCitizenIdValid
                }"
                :disabled="isSubmitting"
                required
              />
              
              <!-- Validation Messages -->
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
                  !isCitizenIdValid && form.citizen_id.replace(/\D/g, '').length === 13
                    ? 'text-red-500'
                    : 'text-muted-foreground'
                ]"
              >
                <AlertCircle 
                  v-if="!isCitizenIdValid && form.citizen_id.replace(/\D/g, '').length === 13"
                  class="h-4 w-4"
                />
                {{ citizenIdValidationMessage }}
              </p>
              
              <p v-else class="text-xs text-muted-foreground">
                กรอกเลขประจำตัวประชาชน 13 หลัก
              </p>
            </div>

            <!-- Birth Date Field -->
            <div class="space-y-2">
              <Label for="birth_date">
                วันเกิด
              </Label>
              <Input
                id="birth_date"
                v-model="form.birth_date"
                type="date"
                :max="new Date().toISOString().split('T')[0]"
                :class="{ 
                  'border-red-500': form.errors.birth_date || (form.birth_date && birthDateValidationMessage.includes('ต้อง'))
                }"
                :disabled="isSubmitting"
              />
              
              <!-- Validation Messages -->
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
                  birthDateValidationMessage.includes('ต้อง') ? 'text-red-500' : 'text-muted-foreground'
                ]"
              >
                {{ birthDateValidationMessage }}
              </p>
              
              <p v-else class="text-xs text-muted-foreground">
                เลือกวันเกิดของประชาชน
              </p>
            </div>

            <!-- Remark Field -->
            <div class="space-y-2">
              <Label for="remark">
                หมายเหตุ
              </Label>
              <Textarea
                id="remark"
                v-model="form.remark"
                placeholder="กรอกหมายเหตุเพิ่มเติม (ถ้ามี)"
                rows="4"
                maxlength="1000"
                :class="{ 'border-red-500': form.errors.remark }"
                :disabled="isSubmitting"
              />
              
              <!-- Validation Messages -->
              <p 
                v-if="form.errors.remark" 
                class="text-sm text-red-500 flex items-center gap-1"
              >
                <AlertCircle class="h-4 w-4" />
                {{ form.errors.remark }}
              </p>
              
              <p v-else class="text-xs text-muted-foreground flex items-center justify-between">
                <span>กรอกหมายเหตุหรือข้อมูลเพิ่มเติม</span>
                <span>{{ form.remark?.length || 0 }}/1000</span>
              </p>
            </div>

            <!-- Alert สำหรับ Form Errors -->
            <Alert v-if="Object.keys(form.errors).length > 0" variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>
                กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง
              </AlertDescription>
            </Alert>

            <!-- Form Actions -->
            <div class="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                @click="cancel"
                :disabled="isSubmitting"
                class="w-full sm:w-auto"
              >
                <ArrowLeft class="h-4 w-4 mr-2" />
                ยกเลิก
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                @click="form.reset()"
                :disabled="isSubmitting || !form.isDirty"
                class="w-full sm:w-auto"
              >
                <X class="h-4 w-4 mr-2" />
                ล้างข้อมูล
              </Button>
              
              <Button
                type="submit"
                :disabled="!canSubmit"
                class="w-full sm:w-auto sm:ml-auto"
              >
                <Save class="h-4 w-4 mr-2" />
                <span v-if="isSubmitting">กำลังบันทึก...</span>
                <span v-else>บันทึกข้อมูล</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Help Card -->
      <Card class="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle class="text-blue-900 dark:text-blue-100 text-base">
            คำแนะนำ
          </CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <ul class="list-disc list-inside space-y-1">
            <li>เลขประจำตัวประชาชนต้องมี 13 หลักและถูกต้องตาม checksum</li>
            <li>วันเกิดต้องเป็นวันที่ในอดีตและหลังปี ค.ศ. 1900</li>
            <li>หมายเหตุสามารถกรอกได้สูงสุด 1,000 ตัวอักษร</li>
            <li>ระบบจะจัดรูปแบบเลขประจำตัวประชาชนให้อัตโนมัติขณะพิมพ์</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
