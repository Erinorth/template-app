import { ref } from 'vue'
import { useToast } from './useToast'

/**
 * Universal error handler สำหรับจัดการข้อผิดพลาดในระบบ
 * รวมถึง logging และแสดงข้อความแจ้งเตือนที่เหมาะสม
 */
export function useErrorHandler() {
  const { toast } = useToast()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * จัดการข้อผิดพลาดแบบ Safe
   * @param operation - ฟังก์ชันที่ต้องการดำเนินการ
   * @param errorMessage - ข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาด
   * @param successMessage - ข้อความแจ้งเตือนเมื่อสำเร็จ
   * @returns ผลลัพธ์ของการดำเนินการ หรือ null หากเกิดข้อผิดพลาด
   */
  const safeExecute = async <T>(
    operation: () => Promise<T> | T,
    errorMessage?: string,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      isLoading.value = true
      error.value = null

      const result = await operation()
      
      if (successMessage) {
        toast.success(successMessage)
      }
      
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      error.value = errorMsg
      
      // Log error สำหรับ debugging
      console.error('Operation failed:', {
        error: err,
        message: errorMsg,
        operation: operation.name || 'anonymous',
        timestamp: new Date().toLocaleString('th-TH')
      })
      
      // แสดงข้อความแจ้งเตือน
      toast.error(errorMessage || `เกิดข้อผิดพลาด: ${errorMsg}`)
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * จัดการข้อผิดพลาดแบบ Sync
   */
  const safeExecuteSync = <T>(
    operation: () => T,
    errorMessage?: string,
    successMessage?: string
  ): T | null => {
    try {
      error.value = null
      
      const result = operation()
      
      if (successMessage) {
        toast.success(successMessage)
      }
      
      return result
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
      error.value = errorMsg
      
      console.error('Sync operation failed:', {
        error: err,
        message: errorMsg,
        operation: operation.name || 'anonymous',
        timestamp: new Date().toLocaleString('th-TH')
      })
      
      toast.error(errorMessage || `เกิดข้อผิดพลาด: ${errorMsg}`)
      
      return null
    }
  }

  /**
   * รีเซ็ตสถานะ error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    isLoading,
    error,
    safeExecute,
    safeExecuteSync,
    clearError
  }
}
