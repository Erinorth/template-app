<script setup lang="ts">
import { Head, useForm, router, usePage } from '@inertiajs/vue3' // เพิ่ม router และ usePage
import { computed, ref } from 'vue'
import { z } from 'zod'
import { toast } from 'vue-sonner'
import { Save, ArrowLeft, DollarSign } from 'lucide-vue-next'

import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AutoForm } from '@/components/ui/auto-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import type { BreadcrumbItem } from '@/types'

// ใช้ usePage() เพื่อเข้าถึงข้อมูล page
const page = usePage()

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'หน้าแรก',
    href: '/dashboard',
  },
  {
    title: 'การชำระเงิน',
    href: '/payments2',
  },
  {
    title: 'สร้างใหม่',
    href: '/payments2/create',
  }
]

// กำหนด validation schema ด้วย Zod
const paymentSchema = z.object({
  status: z.enum(['success', 'pending', 'cancelled'], {
    required_error: 'กรุณาเลือกสถานะการชำระเงิน',
    invalid_type_error: 'สถานะที่เลือกไม่ถูกต้อง'
  }).describe('สถานะการชำระเงิน'),
  
  amount: z
    .number({
      required_error: 'กรุณาระบุจำนวนเงิน',
      invalid_type_error: 'จำนวนเงินต้องเป็นตัวเลข'
    })
    .min(0.01, 'จำนวนเงินต้องมากกว่า 0.01')
    .max(999999.99, 'จำนวนเงินต้องไม่เกิน 999,999.99')
    .describe('จำนวนเงิน'),
    
  currency: z.enum(['USD', 'THB', 'EUR', 'GBP'], {
    required_error: 'กรุณาเลือกสกุลเงิน',
    invalid_type_error: 'สกุลเงินที่เลือกไม่รองรับ'
  }).describe('สกุลเงิน'),
  
  email: z
    .string({
      required_error: 'กรุณาระบุอีเมล'
    })
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(255, 'อีเมลต้องไม่เกิน 255 ตัวอักษร')
    .describe('อีเมล')
})

type PaymentFormData = z.infer<typeof paymentSchema>

// กำหนดค่าเริ่มต้นของฟอร์ม
const defaultValues: PaymentFormData = {
  status: 'pending',
  amount: 0,
  currency: 'THB',
  email: ''
}

// ใช้ Inertia form
const form = useForm<PaymentFormData>(defaultValues)

// สถานะการประมวลผล
const isSubmitting = ref(false)

// กำหนดการแสดงผลแต่ละฟิลด์
const fieldConfig = {
  status: {
    component: 'select' as const,
    label: 'สถานะการชำระเงิน',
    description: 'เลือกสถานะของการชำระเงิน'
  },
  amount: {
    component: 'number' as const,
    label: 'จำนวนเงิน',
    description: 'ระบุจำนวนเงินที่ต้องการชำระ',
    inputProps: {
      min: 0.01,
      max: 999999.99,
      step: 0.01,
      placeholder: '0.00'
    }
  },
  currency: {
    component: 'select' as const,
    label: 'สกุลเงิน',
    description: 'เลือกสกุลเงินที่ต้องการ'
  },
  email: {
    component: 'string' as const,
    label: 'อีเมล',
    description: 'ระบุอีเมลของผู้ชำระเงิน',
    inputProps: {
      type: 'email',
      placeholder: 'example@domain.com'
    }
  }
}

// ฟังก์ชันการ submit ฟอร์ม
const handleSubmit = async (data: PaymentFormData) => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // แสดง loading toast
    toast.loading('กำลังสร้างการชำระเงิน...')
    
    // ส่งข้อมูลไปยัง backend
    form.transform((data) => ({
      ...data,
      // ปรับปรุงข้อมูลก่อนส่ง
      amount: Number(data.amount),
      email: data.email.toLowerCase().trim()
    })).post('/payments2', {
      onSuccess: () => {
        toast.dismiss()
        toast.success('สร้างการชำระเงินสำเร็จ!')
      },
      onError: (errors) => {
        toast.dismiss()
        console.error('Form errors:', errors)
        
        // แสดงข้อผิดพลาดแต่ละฟิลด์
        Object.entries(errors).forEach(([field, message]) => {
          if (typeof message === 'string') {
            toast.error(`${field}: ${message}`)
          }
        })
      },
      onFinish: () => {
        isSubmitting.value = false
      }
    })
  } catch (error) {
    isSubmitting.value = false
    toast.dismiss()
    toast.error('เกิดข้อผิดพลาดในการสร้างการชำระเงิน')
    console.error('Submit error:', error)
  }
}

// ฟังก์ชันล้างฟอร์ม
const resetForm = () => {
  form.reset()
  toast.info('ล้างข้อมูลฟอร์มแล้ว')
}

// ฟังก์ชันการนำทาง (แก้ไขใช้ router แทน $inertia)
const goBack = () => {
  router.visit('/payments2')
}

// ตรวจสอบสถานะฟอร์ม
const hasErrors = computed(() => Object.keys(form.errors).length > 0)
const isDirty = computed(() => form.isDirty)

// เข้าถึง user data ผ่าน page props
const currentUser = computed(() => page.props.auth?.user)
</script>

<template>
  <Head title="สร้างการชำระเงิน - Payment Management" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      
      <!-- Header Section -->
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl font-bold tracking-tight md:text-3xl">
            สร้างการชำระเงินใหม่
          </h1>
          <p class="text-muted-foreground">
            กรอกข้อมูลเพื่อสร้างการชำระเงินใหม่ในระบบ
          </p>
        </div>

        <!-- Back Button (แก้ไขใช้ router.visit แทน $inertia.visit) -->
        <Button 
          variant="outline" 
          @click="goBack"
          class="w-fit"
        >
          <ArrowLeft class="w-4 h-4 mr-2" />
          กลับไปรายการ
        </Button>
      </div>

      <!-- Main Content -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Form Section -->
        <div class="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <DollarSign class="w-5 h-5" />
                ข้อมูลการชำระเงิน
              </CardTitle>
              <CardDescription>
                กรอกข้อมูลการชำระเงินที่ต้องการสร้าง
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- แสดง Error Alert หากมีข้อผิดพลาด -->
              <Alert v-if="hasErrors" variant="destructive">
                <AlertDescription>
                  กรุณาตรวจสอบข้อมูลที่กรอกและแก้ไขข้อผิดพลาด
                </AlertDescription>
              </Alert>

              <!-- AutoForm Component -->
              <AutoForm
                :schema="paymentSchema"
                :field-config="fieldConfig"
                @submit="handleSubmit"
                class="space-y-6"
              >
                <template #default="{ shapes }">
                  <!-- Custom form layout -->
                  <div class="grid gap-6 md:grid-cols-2">
                    <!-- Status Field -->
                    <div class="md:col-span-1">
                      <slot name="status" />
                    </div>
                    
                    <!-- Currency Field -->
                    <div class="md:col-span-1">
                      <slot name="currency" />
                    </div>
                    
                    <!-- Amount Field -->
                    <div class="md:col-span-1">
                      <slot name="amount" />
                    </div>
                    
                    <!-- Email Field -->
                    <div class="md:col-span-1">
                      <slot name="email" />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <!-- Form Actions -->
                  <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      @click="resetForm"
                      :disabled="isSubmitting || !isDirty"
                    >
                      ล้างข้อมูล
                    </Button>
                    
                    <div class="flex gap-3">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        @click="goBack"
                        :disabled="isSubmitting"
                      >
                        ยกเลิก
                      </Button>
                      
                      <Button 
                        type="submit"
                        :disabled="isSubmitting || hasErrors"
                        class="min-w-[120px]"
                      >
                        <Save class="w-4 h-4 mr-2" />
                        {{ isSubmitting ? 'กำลังบันทึก...' : 'บันทึก' }}
                      </Button>
                    </div>
                  </div>
                </template>
              </AutoForm>
            </CardContent>
          </Card>
        </div>

        <!-- Info Sidebar -->
        <div class="space-y-6">
          <!-- Help Card -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">คำแนะนำ</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4 text-sm">
              <div>
                <h4 class="font-medium mb-2">สถานะการชำระเงิน:</h4>
                <ul class="space-y-1 text-muted-foreground">
                  <li>• <strong>รอดำเนินการ:</strong> รอการยืนยัน</li>
                  <li>• <strong>สำเร็จ:</strong> ชำระเงินเรียบร้อย</li>
                  <li>• <strong>ยกเลิก:</strong> ยกเลิกการชำระ</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 class="font-medium mb-2">สกุลเงินที่รองรับ:</h4>
                <ul class="space-y-1 text-muted-foreground">
                  <li>• <strong>THB:</strong> บาทไทย</li>
                  <li>• <strong>USD:</strong> ดอลลาร์สหรัฐ</li>
                  <li>• <strong>EUR:</strong> ยูโร</li>
                  <li>• <strong>GBP:</strong> ปอนด์อังกฤษ</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <!-- Quick Stats Card -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">ข้อมูลสรุป</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">ผู้สร้าง:</span>
                <span class="font-medium">{{ currentUser?.name || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">วันที่สร้าง:</span>
                <span class="font-medium">{{ new Date().toLocaleDateString('th-TH') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Payment ID:</span>
                <span class="font-medium text-muted-foreground">สร้างอัตโนมัติ</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
