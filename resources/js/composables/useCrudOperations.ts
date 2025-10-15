// ไฟล์: resources/js/composables/useCrudOperations.ts
// Composable สำหรับจัดการ CRUD operations พร้อม custom actions

import { router } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import { ref, type Ref } from 'vue'
import type { Component } from 'vue'

/**
 * Interface พื้นฐานสำหรับ Entity ทั่วไป
 */
export interface BaseEntity {
  id: number | string
  created_at?: string | null
  updated_at?: string | null
  [key: string]: any
}

/**
 * Interface สำหรับ Options ของการลบข้อมูล
 */
export interface DeleteOptions {
  /** แสดง confirmation dialog ก่อนลบหรือไม่ (default: true) */
  confirm?: boolean
  /** ข้อความใน confirmation dialog */
  confirmMessage?: string
  /** ข้อความเมื่อลบสำเร็จ */
  successMessage?: string
  /** ข้อความเมื่อเกิด error */
  errorMessage?: string
  /** รักษา scroll position หรือไม่ (default: true) */
  preserveScroll?: boolean
  /** รักษา state หรือไม่ (default: true) */
  preserveState?: boolean
  /** Callback เมื่อสำเร็จ */
  onSuccess?: () => void
  /** Callback เมื่อเกิด error */
  onError?: (errors: any) => void
}

/**
 * Interface สำหรับ options ของ Custom Action Handler
 */
export interface CustomActionOptions<T extends BaseEntity> {
  /** แสดง loading indicator หรือไม่ (default: true) */
  showLoading?: boolean
  /** ข้อความขณะ loading */
  loadingMessage?: string
  /** ข้อความเมื่อสำเร็จ */
  successMessage?: string
  /** ข้อความเมื่อเกิด error */
  errorMessage?: string
  /** แสดง confirmation dialog ก่อนดำเนินการหรือไม่ (default: false) */
  confirm?: boolean
  /** ข้อความใน confirmation dialog */
  confirmMessage?: string
  /** Function สำหรับแปลงข้อมูลก่อนส่งไปยัง handler */
  transformData?: (item: T) => any
  /** Callback เมื่อสำเร็จ */
  onSuccess?: (item: T, result?: any) => void
  /** Callback เมื่อเกิด error */
  onError?: (item: T, error: any) => void
}

/**
 * Type สำหรับ Custom Action Handler Function
 */
export type CustomActionHandler<T extends BaseEntity> = (
  item: T,
  options?: CustomActionOptions<T>
) => void | Promise<void>

/**
 * Interface สำหรับกำหนด Custom Action
 * รองรับทั้ง business logic และ UI properties
 */
export interface CustomAction<T extends BaseEntity> {
  /** Key สำหรับระบุ action (ต้องไม่ซ้ำกัน) */
  key: string
  
  /** ข้อความแสดงบน UI */
  label: string
  
  /** Handler function สำหรับดำเนินการ */
  handler: CustomActionHandler<T>
  
  /** Options เริ่มต้นสำหรับ action นี้ */
  defaultOptions?: CustomActionOptions<T>
  
  /** Icon component จาก lucide-vue-next (optional) */
  icon?: Component
  
  /** รูปแบบปุ่ม (optional) */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  
  /** CSS class เพิ่มเติม (optional) */
  className?: string
  
  /** แสดง separator ก่อนหน้า action นี้หรือไม่ (optional) */
  separator?: boolean
  
  /** ซ่อน/แสดง action ตามเงื่อนไข (optional) */
  visible?: boolean
  
  /** ปิดใช้งาน action หรือไม่ (optional) */
  disabled?: boolean
}

/**
 * Interface สำหรับการตั้งค่า CRUD Config
 */
export interface CrudConfig<T extends BaseEntity> {
  /** Prefix ของ route name (เช่น 'citizens', 'users') */
  routePrefix: string
  /** ชื่อ entity ที่แสดงในข้อความ */
  entityDisplayName: string
  /** Field ที่ใช้แสดงชื่อ entity หรือ function สำหรับสร้างชื่อ */
  displayField?: keyof T | ((item: T) => string)
  /** Custom actions ที่สามารถทำได้กับ entity นี้ */
  customActions?: Record<string, CustomAction<T>>
  /** ข้อความต่างๆ ที่ใช้ในระบบ */
  messages?: {
    deleteConfirm?: string
    deleteSuccess?: string
    deleteError?: string
    unknownAction?: string
    viewSuccess?: string
    editSuccess?: string
  }
  /** Options สำหรับการลบ */
  deleteOptions?: Partial<DeleteOptions>
  /** เปิดใช้งาน logging หรือไม่ (default: false) */
  enableLogging?: boolean
}

/**
 * Interface สำหรับ return value ของ useCrudOperations
 */
export interface CrudOperations<T extends BaseEntity> {
  /** ฟังก์ชันสำหรับดูรายละเอียด */
  viewItem: (item: T) => void
  /** ฟังก์ชันสำหรับแก้ไขข้อมูล */
  editItem: (item: T) => void
  /** ฟังก์ชันสำหรับลบข้อมูล */
  deleteItem: (item: T, options?: DeleteOptions) => void
  /** ฟังก์ชันสำหรับดำเนินการ custom action */
  handleCustomAction: (actionKey: string, item: T, options?: CustomActionOptions<T>) => Promise<void>
  /** ฟังก์ชันสำหรับดึงชื่อแสดงผลของ entity */
  getDisplayName: (item: T) => string
  /** สถานะว่ากำลังลบหรือไม่ */
  isDeleting: Ref<boolean>
  /** สถานะว่ากำลังประมวลผล action หรือไม่ */
  isProcessing: Ref<boolean>
  /** Action ที่กำลังดำเนินการอยู่ */
  currentAction: Ref<string | null>
}

/**
 * Composable สำหรับจัดการ CRUD operations
 * รองรับการดู แก้ไข ลบ และ custom actions
 * 
 * @param config - การตั้งค่า CRUD config
 * @returns CrudOperations object พร้อม functions และ reactive states
 * 
 * @example
 * const crud = useCrudOperations<Citizen>({
 *   routePrefix: 'citizens',
 *   entityDisplayName: 'ประชากร',
 *   displayField: 'citizen_id',
 *   customActions: {
 *     generateCard: { ... }
 *   }
 * })
 */
export function useCrudOperations<T extends BaseEntity>(
  config: CrudConfig<T>
): CrudOperations<T> {
  // State management
  const isDeleting = ref(false)
  const isProcessing = ref(false)
  const currentAction = ref<string | null>(null)

  /**
   * ฟังก์ชัน log สำหรับการตรวจสอบ
   */
  function log(message: string, data?: any): void {
    if (config.enableLogging !== false) {
      console.log(`[${config.entityDisplayName}] ${message}`, data)
    }
  }

  /**
   * ดึงชื่อแสดงผลของ entity
   */
  function getDisplayName(item: T): string {
    if (!config.displayField) {
      return `ID: ${item.id}`
    }

    if (typeof config.displayField === 'function') {
      return config.displayField(item)
    }

    const fieldValue = item[config.displayField]
    return fieldValue ? String(fieldValue) : `ID: ${item.id}`
  }

  /**
   * สร้าง timestamp ปัจจุบัน
   */
  function getTimestamp(): string {
    return new Date().toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  /**
   * ฟังก์ชันสำหรับดูรายละเอียด
   */
  function viewItem(item: T): void {
    log('View item', {
      id: item.id,
      displayName: getDisplayName(item),
      timestamp: getTimestamp()
    })

    try {
      router.get(route(`${config.routePrefix}.show`, item.id), {}, {
        onSuccess: () => {
          if (config.messages?.viewSuccess) {
            toast.success(config.messages.viewSuccess)
          }
        },
        onError: (errors) => {
          log('View error', { id: item.id, errors })
          toast.error('ไม่สามารถดูรายละเอียดได้')
        }
      })
    } catch (error) {
      log('View exception', { id: item.id, error })
      toast.error('เกิดข้อผิดพลาดในการดูรายละเอียด')
    }
  }

  /**
   * ฟังก์ชันสำหรับแก้ไขข้อมูล
   */
  function editItem(item: T): void {
    log('Edit item', {
      id: item.id,
      displayName: getDisplayName(item),
      timestamp: getTimestamp()
    })

    try {
      router.get(route(`${config.routePrefix}.edit`, item.id), {}, {
        onSuccess: () => {
          if (config.messages?.editSuccess) {
            toast.success(config.messages.editSuccess)
          }
        },
        onError: (errors) => {
          log('Edit error', { id: item.id, errors })
          toast.error('ไม่สามารถแก้ไขได้')
        }
      })
    } catch (error) {
      log('Edit exception', { id: item.id, error })
      toast.error('เกิดข้อผิดพลาดในการแก้ไข')
    }
  }

  /**
   * ฟังก์ชันสำหรับลบข้อมูล
   */
  function deleteItem(item: T, options?: DeleteOptions): void {
    const mergedOptions: DeleteOptions = {
      confirm: true,
      preserveScroll: true,
      preserveState: true,
      ...config.deleteOptions,
      ...options
    }

    log('Delete item initiated', {
      id: item.id,
      displayName: getDisplayName(item),
      options: mergedOptions,
      timestamp: getTimestamp()
    })

    const displayName = getDisplayName(item)

    // แสดง confirmation dialog
    if (mergedOptions.confirm) {
      const confirmMessage =
        mergedOptions.confirmMessage ||
        config.messages?.deleteConfirm ||
        `คุณต้องการลบ ${config.entityDisplayName} "${displayName}" หรือไม่?`

      if (!confirm(confirmMessage)) {
        log('Delete cancelled by user', { id: item.id })
        return
      }
    }

    isDeleting.value = true
    currentAction.value = 'delete'

    router.delete(route(`${config.routePrefix}.destroy`, item.id), {
      preserveScroll: mergedOptions.preserveScroll,
      preserveState: mergedOptions.preserveState,
      onSuccess: () => {
        isDeleting.value = false
        currentAction.value = null

        const successMessage =
          mergedOptions.successMessage ||
          config.messages?.deleteSuccess ||
          `ลบ ${config.entityDisplayName} "${displayName}" สำเร็จ`

        log('Delete success', {
          id: item.id,
          displayName,
          timestamp: getTimestamp()
        })

        toast.success(successMessage)

        if (mergedOptions.onSuccess) {
          mergedOptions.onSuccess()
        }
      },
      onError: (errors) => {
        isDeleting.value = false
        currentAction.value = null

        const errorMessage =
          mergedOptions.errorMessage ||
          config.messages?.deleteError ||
          `ไม่สามารถลบ ${config.entityDisplayName} ได้`

        log('Delete error', {
          id: item.id,
          displayName,
          errors,
          timestamp: getTimestamp()
        })

        toast.error(errorMessage)

        if (mergedOptions.onError) {
          mergedOptions.onError(errors)
        }
      }
    })
  }

  /**
   * ฟังก์ชันสำหรับดำเนินการ custom action
   */
  async function handleCustomAction(
    actionKey: string,
    item: T,
    options?: CustomActionOptions<T>
  ): Promise<void> {
    log('Custom action initiated', {
      actionKey,
      itemId: item.id,
      displayName: getDisplayName(item),
      timestamp: getTimestamp()
    })

    const action = config.customActions?.[actionKey]

    if (!action) {
      log('Unknown action', {
        actionKey,
        availableActions: Object.keys(config.customActions || {})
      })

      const unknownMessage =
        config.messages?.unknownAction || `ไม่พบคำสั่ง "${actionKey}"`

      toast.error(unknownMessage)
      return
    }

    const mergedOptions: CustomActionOptions<T> = {
      showLoading: true,
      confirm: false,
      ...action.defaultOptions,
      ...options
    }

    // แสดง confirmation dialog ถ้าต้องการ
    if (mergedOptions.confirm) {
      const confirmMessage =
        mergedOptions.confirmMessage ||
        `คุณต้องการดำเนินการ "${action.label}" หรือไม่?`

      if (!confirm(confirmMessage)) {
        log('Custom action cancelled by user', {
          actionKey,
          itemId: item.id
        })
        return
      }
    }

    // แสดง loading indicator
    if (mergedOptions.showLoading) {
      isProcessing.value = true
      currentAction.value = actionKey

      if (mergedOptions.loadingMessage) {
        toast.loading(mergedOptions.loadingMessage)
      }
    }

    try {
      // แปลงข้อมูลถ้ามี transformData function
      const transformedItem = mergedOptions.transformData
        ? mergedOptions.transformData(item)
        : item

      // เรียก handler
      const result = await action.handler(transformedItem, mergedOptions)

      log('Custom action success', {
        actionKey,
        itemId: item.id,
        timestamp: getTimestamp()
      })

      // แสดงข้อความสำเร็จ
      if (mergedOptions.successMessage) {
        toast.success(mergedOptions.successMessage)
      }

      // เรียก callback ถ้ามี
      if (mergedOptions.onSuccess) {
        mergedOptions.onSuccess(item, result)
      }
    } catch (error) {
      log('Custom action error', {
        actionKey,
        itemId: item.id,
        error,
        timestamp: getTimestamp()
      })

      const errorMessage =
        mergedOptions.errorMessage ||
        `ไม่สามารถดำเนินการ "${action.label}" ได้`

      toast.error(errorMessage)

      // เรียก error callback ถ้ามี
      if (mergedOptions.onError) {
        mergedOptions.onError(item, error)
      }
    } finally {
      // ปิด loading indicator
      if (mergedOptions.showLoading) {
        isProcessing.value = false
        currentAction.value = null
        toast.dismiss()
      }
    }
  }

  return {
    viewItem,
    editItem,
    deleteItem,
    handleCustomAction,
    getDisplayName,
    isDeleting,
    isProcessing,
    currentAction
  }
}
