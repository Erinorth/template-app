<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

// ... (interface และ props เดิม)

interface Citizen {
  id?: number
  citizen_id: string
  birth_date: string | null
  remark: string | null
}

const props = defineProps<{
  title?: string
  citizen?: Citizen
}>()

const isEditMode = computed(() => !!props.citizen?.id)

const pageTitle = computed(() => {
  if (props.title) return props.title
  return isEditMode.value ? 'แก้ไขข้อมูลประชาชน' : 'เพิ่มข้อมูลประชาชน'
})

const pageDescription = computed(() => {
  return isEditMode.value 
    ? 'แก้ไขข้อมูลประชาชนในระบบ' 
    : 'กรอกข้อมูลเพื่อเพิ่มประชาชนเข้าสู่ระบบ'
})

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

const form = useForm({
  citizen_id: props.citizen?.citizen_id || '',
  birth_date: props.citizen?.birth_date || '',
  remark: props.citizen?.remark || '',
})

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
 * ✅ ฟังก์ชันลบขีดและอักขระพิเศษ เหลือเฉพาะตัวเลข
 * สำหรับส่งข้อมูลไปยัง Backend
 */
function cleanCitizenId(value: string): string {
  return value.replace(/\D/g, '')
}

function handleCitizenIdInput(event: Event) {
  const input = event.target as HTMLInputElement
  const formatted = formatCitizenId(input.value)
  form.citizen_id = formatted
  
  console.log('Citizen ID input:', { original: input.value, formatted })
}

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

const citizenIdValidationMessage = computed(() => {
  if (!form.citizen_id) return ''
  
  const cleaned = cleanCitizenId(form.citizen_id)
  
  if (cleaned.length > 0 && cleaned.length < 13) {
    return 'กรุณากรอกเลขประจำตัวประชาชนให้ครบ 13 หลัก'
  }
  
  if (cleaned.length === 13 && !isCitizenIdValid.value) {
    return 'เลขประจำตัวประชาชนไม่ถูกต้อง'
  }
  
  return ''
})

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
  
  const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  
  if (age > 150) {
    return 'วันเกิดไม่สมเหตุสมผล'
  }
  
  return `อายุ ${age} ปี`
})

const canSubmit = computed(() => {
  return form.citizen_id && 
         isCitizenIdValid.value && 
         !isSubmitting.value &&
         !citizenIdValidationMessage.value.includes('ไม่ถูกต้อง')
})

/**
 * ✅ Submit form - แก้ไขให้ลบขีดออกก่อนส่ง
 */
function submit() {
  if (!canSubmit.value) {
    toast.error('กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง')
    return
  }
  
  const mode = isEditMode.value ? 'edit' : 'create'
  
  // ✅ เตรียมข้อมูลที่จะส่ง - ลบขีดออกจาก citizen_id
  const submitData = {
    citizen_id: cleanCitizenId(form.citizen_id), // ส่งเฉพาะตัวเลข 13 หลัก
    birth_date: form.birth_date,
    remark: form.remark,
  }
  
  console.log(`CitizenForm: Submitting form (${mode} mode)`, {
    original: form.data(),
    cleaned: submitData
  })
  
  isSubmitting.value = true
  
  if (isEditMode.value) {
    // ✅ โหมด edit - ใช้ transform เพื่อแปลงข้อมูลก่อนส่ง
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
    // ✅ โหมด create - ใช้ transform เพื่อแปลงข้อมูลก่อนส่ง
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

function resetForm() {
  console.log(`CitizenForm: Resetting form (${isEditMode.value ? 'edit' : 'create'} mode)`)
  form.reset()
  toast.success('รีเซ็ตข้อมูลฟอร์มเรียบร้อยแล้ว')
}

onMounted(() => {
  console.log('CitizenForm: Component initialized', {
    mode: isEditMode.value ? 'edit' : 'create',
    citizen: props.citizen || null
  })
})
</script>

<!-- Template เดิม ไม่ต้องแก้ -->
<template>
  <Head :title="pageTitle" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-4xl">
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

            <Alert v-if="Object.keys(form.errors).length > 0" variant="destructive">
              <AlertCircle class="h-4 w-4" />
              <AlertDescription>
                กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง
              </AlertDescription>
            </Alert>

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
            <li v-if="isEditMode" class="font-semibold">คุณกำลังแก้ไขข้อมูลประชาชน หากต้องการยกเลิกกด "ยกเลิก" หรือกดปุ่ม "ล้างข้อมูล" เพื่อรีเซ็ตค่าเดิม</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
