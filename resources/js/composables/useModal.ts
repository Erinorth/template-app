// สถานที่จัดเก็บ: resources/js/composables/useModal.ts
import { ref } from 'vue'
import { useForm, type InertiaForm } from '@inertiajs/vue3'

/**
 * Simple Modal Composable
 * สำหรับจัดการ state ของ modal แบบง่าย
 */
export function useModal() {
  const isOpen = ref(false)

  /**
   * เปิด modal
   */
  const open = () => {
    console.log('useModal: Opening modal')
    isOpen.value = true
  }

  /**
   * ปิด modal
   */
  const close = () => {
    console.log('useModal: Closing modal')
    isOpen.value = false
  }

  /**
   * Toggle modal state
   */
  const toggle = () => {
    isOpen.value = !isOpen.value
    console.log('useModal: Toggled modal', { isOpen: isOpen.value })
  }

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

/**
 * Form Modal Composable
 * สำหรับจัดการ modal ที่มี form พร้อมการ submit
 */
export function useFormModal<T extends Record<string, any>>(
  initialData: T,
  submitRoute: string
) {
  const isOpen = ref(false)
  const isSubmitting = ref(false)
  const form: InertiaForm<T> = useForm(initialData)

  /**
   * เปิด modal
   */
  const open = () => {
    console.log('useFormModal: Opening modal')
    isOpen.value = true
  }

  /**
   * ปิด modal และ reset form
   */
  const close = () => {
    console.log('useFormModal: Closing modal')
    isOpen.value = false
    form.reset()
    form.clearErrors()
  }

  /**
   * Submit form ไปยัง server
   * @param onSuccess - callback เมื่อ submit สำเร็จ
   */
  const submit = (onSuccess?: () => void) => {
    console.log('useFormModal: Submitting form', { route: submitRoute })
    isSubmitting.value = true
    
    form.post(submitRoute, {
      preserveScroll: true,
      onSuccess: () => {
        console.log('useFormModal: Form submitted successfully')
        onSuccess?.()
        close()
      },
      onError: (errors) => {
        console.error('useFormModal: Form submission failed', { errors })
      },
      onFinish: () => {
        console.log('useFormModal: Form submission finished')
        isSubmitting.value = false
      }
    })
  }

  return {
    isOpen,
    isSubmitting,
    form,
    open,
    close,
    submit
  }
}
