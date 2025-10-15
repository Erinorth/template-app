<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useForm, Head } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import type { BreadcrumbItem } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Save, X, ArrowLeft } from 'lucide-vue-next'
// นำเข้าฟังก์ชันจาก utils
import { formatThaiCitizenId } from '@/lib/utils'

// Form Field Components
import { CitizenIdField, BirthDateField, RemarkField } from '@/components/custom/form-fields'

// Import types
import type { Citizen } from './types'

// Props จาก Controller
const props = defineProps<{
  title?: string
  citizen?: Citizen
}>()

// ตรวจสอบว่าอยู่ใน edit mode หรือไม่
const isEditMode = computed(() => !!props.citizen?.id)

// Title ของหน้า
const pageTitle = computed(() => {
  if (props.title) return props.title
  return isEditMode.value ? 'แก้ไขข้อมูลประชาชน' : 'เพิ่มข้อมูลประชาชน'
})

// Description ของหน้า
const pageDescription = computed(() => {
  return isEditMode.value
    ? 'แก้ไขข้อมูลประชาชนในระบบ'
    : 'เพิ่มข้อมูลประชาชนใหม่ในระบบ'
})

// Breadcrumbs
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const baseCrumbs: BreadcrumbItem[] = [
    { title: 'หน้าหลัก', href: route('dashboard') },
    { title: 'ข้อมูลประชาชน', href: route('citizens.index') },
  ]

  if (isEditMode.value) {
    baseCrumbs.push({
      title: 'แก้ไข',
      href: route('citizens.edit', props.citizen!.id!),
    })
  } else {
    baseCrumbs.push({
      title: 'เพิ่มข้อมูล',
      href: route('citizens.create'),
    })
  }

  return baseCrumbs
})

// Form state โดยจัดรูปแบบ citizen_id ด้วย formatThaiCitizenId
const form = useForm({
  citizen_id: props.citizen?.citizen_id ? formatThaiCitizenId(props.citizen.citizen_id) : '',
  birth_date: props.citizen?.birth_date ?? '',
  remark: props.citizen?.remark ?? '',
})

// State สำหรับ submit
const isSubmitting = ref(false)

// ฟังก์ชันลบอักขระที่ไม่ใช่ตัวเลข
function cleanCitizenId(value: string): string {
  return value.replace(/\D/g, '')
}

// ตรวจสอบว่าสามารถ submit ได้หรือไม่
const canSubmit = computed(() => {
  const cleaned = cleanCitizenId(form.citizen_id)
  return cleaned.length === 13 && !isSubmitting.value
})

// Submit form
function submit() {
  if (!canSubmit.value) {
    toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง')
    return
  }

  const mode = isEditMode.value ? 'edit' : 'create'

  // เตรียมข้อมูลสำหรับ submit โดยลบ dash ออกจาก citizen_id
  const submitData = {
    citizen_id: cleanCitizenId(form.citizen_id),
    birth_date: form.birth_date,
    remark: form.remark,
  }

  console.log(`CitizenForm: Submitting form (${mode})`, {
    original: form.data(),
    cleaned: submitData,
  })

  isSubmitting.value = true

  if (isEditMode.value) {
    form.transform(() => submitData).put(route('citizens.update', props.citizen!.id!), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('CitizenForm: Form updated successfully')
        toast.success('แก้ไขข้อมูลสำเร็จ')
      },
      onError: (errors) => {
        console.error('CitizenForm: Validation errors', errors)
        toast.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล')
      },
      onFinish: () => {
        isSubmitting.value = false
      },
    })
  } else {
    form.transform(() => submitData).post(route('citizens.store'), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('CitizenForm: Form created successfully')
        toast.success('เพิ่มข้อมูลสำเร็จ')
      },
      onError: (errors) => {
        console.error('CitizenForm: Validation errors', errors)
        toast.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล')
      },
      onFinish: () => {
        isSubmitting.value = false
      },
    })
  }
}

// ยกเลิกการแก้ไข
function cancel() {
  const mode = isEditMode.value ? 'edit' : 'create'
  console.log(`CitizenForm: Canceling form (${mode})`)

  if (form.isDirty) {
    const message = isEditMode.value
      ? 'คุณมีการเปลี่ยนแปลงข้อมูล ต้องการยกเลิกหรือไม่?'
      : 'คุณมีข้อมูลที่ยังไม่ได้บันทึก ต้องการยกเลิกหรือไม่?'

    if (confirm(message)) {
      form.reset()
      window.history.back()
    }
  } else {
    window.history.back()
  }
}

// รีเซ็ตฟอร์ม
function resetForm() {
  console.log(`CitizenForm: Resetting form (${isEditMode.value ? 'edit' : 'create'} mode)`)
  form.reset()
  toast.success('รีเซ็ตข้อมูลเรียบร้อย')
}

// Component mounted
onMounted(() => {
  console.log('CitizenForm: Component initialized', {
    mode: isEditMode.value ? 'edit' : 'create',
  })
})
</script>

<template>
  <!-- Head title -->
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
          <CardTitle>{{ isEditMode ? 'แก้ไขข้อมูล' : 'กรอกข้อมูล' }}</CardTitle>
          <CardDescription>
            {{ isEditMode ? 'แก้ไขข้อมูลประชาชน' : 'กรอกข้อมูลประชาชนใหม่' }}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="submit" class="space-y-6">
            <!-- CitizenIdField Component - ใช้ v-model กับ form.citizen_id -->
            <CitizenIdField
              v-model="form.citizen_id"
              :error="form.errors.citizen_id"
              :disabled="isSubmitting"
            />

            <!-- BirthDateField Component - ใช้ v-model กับ form.birth_date -->
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
            />

            <!-- Error Alert -->
            <Alert v-if="Object.keys(form.errors).length > 0" variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>
                กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง
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
                รีเซ็ต
              </Button>

              <Button
                type="submit"
                :disabled="!canSubmit"
                class="w-full sm:w-auto sm:ml-auto"
              >
                <Save class="h-4 w-4 mr-2" />
                <span v-if="isSubmitting">กำลังบันทึก...</span>
                <span v-else>{{ isEditMode ? 'บันทึกการแก้ไข' : 'บันทึก' }}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Help Card -->
      <Card class="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle class="text-blue-900 dark:text-blue-100 text-base">
            คำแนะนำการกรอกข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent class="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <ul class="list-disc list-inside space-y-1">
            <li>เลขบัตรประชาชนต้องมี 13 หลักและมีการตรวจสอบด้วย checksum</li>
            <li>วันเกิดต้องไม่เป็นอนาคต และไม่ก่อนปี พ.ศ. 1900</li>
            <li>หมายเหตุสามารถกรอกได้สูงสุด 1,000 ตัวอักษร</li>
            <li v-if="isEditMode" class="font-semibold">
              การแก้ไขจะเป็นการอัพเดทข้อมูลที่มีอยู่ในระบบ
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
