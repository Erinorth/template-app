<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useForm, Head } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { type BreadcrumbItem } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Save, X, ArrowLeft } from 'lucide-vue-next'

// ✅ นำเข้า Form Field Components
import { CitizenIdField, BirthDateField, RemarkField } from '@/components/custom/form-fields'

/**
 * Interface สำหรับ Citizen
 */
interface Citizen {
  id?: number
  citizen_id: string
  birth_date: string | null
  remark: string | null
}

/**
 * Props ที่รับมาจาก Controller
 */
const props = defineProps<{
  title?: string
  citizen?: Citizen
}>()

/**
 * ตรวจสอบว่าอยู่ในโหมด edit หรือไม่
 */
const isEditMode = computed(() => !!props.citizen?.id)

/**
 * Title ของหน้า
 */
const pageTitle = computed(() => {
  if (props.title) return props.title
  return isEditMode.value ? 'แก้ไขข้อมูลประชาชน' : 'เพิ่มข้อมูลประชาชน'
})

/**
 * คำอธิบายของหน้า
 */
const pageDescription = computed(() => {
  return isEditMode.value 
    ? 'แก้ไขข้อมูลประชาชนในระบบ' 
    : 'กรอกข้อมูลเพื่อเพิ่มประชาชนเข้าสู่ระบบ'
})

/**
 * Breadcrumbs สำหรับการนำทาง
 */
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const baseCrumbs = [
    { title: 'หน้าหลัก', href: route('dashboard') },
    { title: 'ข้อมูลประชาชน', href: route('citizens.index') }
  ]
  
  if (isEditMode.value) {
    baseCrumbs.push({ 
      title: 'แก้ไขข้อมูล', 
      href: route('citizens.edit', props.citizen!.id!) 
    })
  } else {
    baseCrumbs.push({ 
      title: 'เพิ่มข้อมูลใหม่', 
      href: route('citizens.create') 
    })
  }
  
  return baseCrumbs
})

/**
 * Form state พร้อม format citizen_id เป็นรูปแบบที่มีขีด
 */
const form = useForm({
  citizen_id: props.citizen?.citizen_id ? formatCitizenId(props.citizen.citizen_id) : '',
  birth_date: props.citizen?.birth_date || '',
  remark: props.citizen?.remark || '',
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
  const cleaned = value.replace(/\D/g, '')
  const limited = cleaned.substring(0, 13)
  
  if (limited.length <= 1) return limited
  if (limited.length <= 5) return `${limited.substring(0, 1)}-${limited.substring(1)}`
  if (limited.length <= 10) return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5)}`
  if (limited.length <= 12) return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10)}`
  
  return `${limited.substring(0, 1)}-${limited.substring(1, 5)}-${limited.substring(5, 10)}-${limited.substring(10, 12)}-${limited.substring(12)}`
}

/**
 * ฟังก์ชันลบขีดและอักขระพิเศษ เหลือเฉพาะตัวเลข
 */
function cleanCitizenId(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * ตรวจสอบว่าสามารถ submit ได้หรือไม่
 */
const canSubmit = computed(() => {
  const cleaned = cleanCitizenId(form.citizen_id)
  return cleaned.length === 13 && !isSubmitting.value
})

/**
 * Submit form
 */
function submit() {
  if (!canSubmit.value) {
    toast.error('กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง')
    return
  }
  
  const mode = isEditMode.value ? 'edit' : 'create'
  
  // เตรียมข้อมูลที่จะส่ง - ลบขีดออกจาก citizen_id
  const submitData = {
    citizen_id: cleanCitizenId(form.citizen_id),
    birth_date: form.birth_date,
    remark: form.remark,
  }
  
  console.log(`CitizenForm: Submitting form (${mode} mode)`, {
    original: form.data(),
    cleaned: submitData
  })
  
  isSubmitting.value = true
  
  if (isEditMode.value) {
    form.transform(() => submitData).put(route('citizens.update', props.citizen!.id!), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('CitizenForm: Form updated successfully')
        toast.success('แก้ไขข้อมูลประชาชนเรียบร้อยแล้ว')
      },
      onError: (errors) => {
        console.error('CitizenForm: Validation errors', errors)
        toast.error('กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง')
      },
      onFinish: () => {
        isSubmitting.value = false
      }
    })
  } else {
    form.transform(() => submitData).post(route('citizens.store'), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('CitizenForm: Form created successfully')
        toast.success('เพิ่มข้อมูลประชาชนเรียบร้อยแล้ว')
      },
      onError: (errors) => {
        console.error('CitizenForm: Validation errors', errors)
        toast.error('กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง')
      },
      onFinish: () => {
        isSubmitting.value = false
      }
    })
  }
}

/**
 * ยกเลิกการแก้ไข
 */
function cancel() {
  const mode = isEditMode.value ? 'edit' : 'create'
  console.log(`CitizenForm: Canceling form (${mode} mode)`)
  
  if (form.isDirty) {
    const message = isEditMode.value 
      ? 'คุณต้องการยกเลิกการแก้ไขข้อมูลหรือไม่? การเปลี่ยนแปลงจะไม่ถูกบันทึก'
      : 'คุณต้องการยกเลิกการเพิ่มข้อมูลหรือไม่? ข้อมูลที่กรอกจะไม่ถูกบันทึก'
    
    if (confirm(message)) {
      form.reset()
      window.history.back()
    }
  } else {
    window.history.back()
  }
}

/**
 * รีเซ็ตฟอร์ม
 */
function resetForm() {
  console.log(`CitizenForm: Resetting form (${isEditMode.value ? 'edit' : 'create'} mode)`)
  form.reset()
  toast.success('รีเซ็ตข้อมูลฟอร์มเรียบร้อยแล้ว')
}

/**
 * Component mounted
 */
onMounted(() => {
  console.log('CitizenForm: Component initialized', {
    mode: isEditMode.value ? 'edit' : 'create',
    citizen: props.citizen || null
  })
})
</script>

<template>
  <Head :title="pageTitle" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <!-- Header Section -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          {{ pageTitle }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ pageDescription }}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลประชาชน</CardTitle>
          <CardDescription>
            {{ isEditMode ? 'แก้ไข' : 'กรอก' }}ข้อมูลพื้นฐานของประชาชน ฟิลด์ที่มีเครื่องหมาย * เป็นฟิลด์ที่จำเป็น
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="submit" class="space-y-6">
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
            />

            <!-- Error Alert -->
            <Alert v-if="Object.keys(form.errors).length > 0" variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>
                กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง
              </AlertDescription>
            </Alert>

            <!-- Action Buttons -->
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
                @click="resetForm"
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
                <span v-else>{{ isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล' }}</span>
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
            <li v-if="isEditMode" class="font-semibold">
              คุณกำลังแก้ไขข้อมูลประชาชน หากต้องการยกเลิกกด "ยกเลิก" หรือกดปุ่ม "ล้างข้อมูล" เพื่อรีเซ็ตค่าเดิม
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
