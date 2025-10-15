// ไฟล์: resources/js/composables/useCrudOperations.ts
// ปรับปรุง CRUD Operations ให้มีความสมบูรณ์ Type-Safe และ Flexible

import { router } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import { ref, computed, type Ref } from 'vue'

// ======= TYPE DEFINITIONS =======

/**
 * Base Entity Interface - ทุก entity ต้อง extend จากนี้
 */
export interface BaseEntity {
  id: number | string
  created_at?: string | null
  updated_at?: string | null
  [key: string]: any
}

/**
 * Options สำหรับ Delete Operation
 */
export interface DeleteOptions {
  /** แสดง confirmation dialog */
  confirm?: boolean
  
  /** ข้อความ confirmation */
  confirmMessage?: string
  
  /** ข้อความ success */
  successMessage?: string
  
  /** ข้อความ error */
  errorMessage?: string
  
  /** Preserve scroll position */
  preserveScroll?: boolean
  
  /** Preserve state */
  preserveState?: boolean
  
  /** Callback เมื่อลบสำเร็จ */
  onSuccess?: () => void
  
  /** Callback เมื่อเกิด error */
  onError?: (errors: any) => void
}

/**
 * Options สำหรับ Custom Action
 */
export interface CustomActionOptions<T extends BaseEntity> {
  /** แสดง loading state */
  showLoading?: boolean
  
  /** Loading message */
  loadingMessage?: string
  
  /** Success message */
  successMessage?: string
  
  /** Error message */
  errorMessage?: string
  
  /** Confirm ก่อนทำงาน */
  confirm?: boolean
  
  /** Confirmation message */
  confirmMessage?: string
  
  /** Transform ข้อมูลก่อนส่ง */
  transformData?: (item: T) => any
  
  /** Callback เมื่อสำเร็จ */
  onSuccess?: (item: T, result?: any) => void
  
  /** Callback เมื่อเกิด error */
  onError?: (item: T, error: any) => void
}

/**
 * Custom Action Handler Type
 */
export type CustomActionHandler<T extends BaseEntity> = (
  item: T,
  options?: CustomActionOptions<T>
) => void | Promise<void>

/**
 * Custom Action Definition
 */
export interface CustomAction<T extends BaseEntity> {
  /** Key สำหรับระบุ action */
  key: string
  
  /** Label ที่แสดง */
  label: string
  
  /** Handler function */
  handler: CustomActionHandler<T>
  
  /** Options เริ่มต้น */
  defaultOptions?: CustomActionOptions<T>
}

/**
 * CRUD Configuration
 */
export interface CrudConfig<T extends BaseEntity> {
  /** Route prefix (เช่น 'citizens', 'users') */
  routePrefix: string
  
  /** ชื่อ entity สำหรับแสดงผล */
  entityDisplayName: string
  
  /** Field สำหรับแสดงชื่อ entity */
  displayField?: keyof T | ((item: T) => string)
  
  /** Custom actions */
  customActions?: Record<string, CustomAction<T>>
  
  /** Default messages */
  messages?: {
    deleteConfirm?: string
    deleteSuccess?: string
    deleteError?: string
    unknownAction?: string
    viewSuccess?: string
    editSuccess?: string
  }
  
  /** Delete options เริ่มต้น */
  deleteOptions?: Partial<DeleteOptions>
  
  /** เปิดใช้งาน logging */
  enableLogging?: boolean
}

/**
 * CRUD Operations Return Type
 */
export interface CrudOperations<T extends BaseEntity> {
  /** ดูรายละเอียด */
  viewItem: (item: T) => void
  
  /** แก้ไข */
  editItem: (item: T) => void
  
  /** ลบ */
  deleteItem: (item: T, options?: DeleteOptions) => void
  
  /** Handle custom action */
  handleCustomAction: (actionKey: string, item: T, options?: CustomActionOptions<T>) => Promise<void>
  
  /** Get display name */
  getDisplayName: (item: T) => string
  
  /** State */
  isDeleting: Ref<boolean>
  isProcessing: Ref<boolean>
  currentAction: Ref<string | null>
}

// ======= MAIN COMPOSABLE =======

/**
 * Enhanced CRUD Operations Composable
 * 
 * @example
 * const crud = useCrudOperations<Citizen>({
 *   routePrefix: 'citizens',
 *   entityDisplayName: 'ประชาชน',
 *   displayField: 'citizen_id',
 *   customActions: {
 *     generateCard: {
 *       key: 'generateCard',
 *       label: 'สร้างบัตร',
 *       handler: async (item) => {
 *         // Handle logic
 *       }
 *     }
 *   }
 * })
 */
export function useCrudOperations<T extends BaseEntity>(
  config: CrudConfig<T>
): CrudOperations<T> {
  
  // ======= STATE =======
  const isDeleting = ref(false)
  const isProcessing = ref(false)
  const currentAction = ref<string | null>(null)

  // ======= HELPER FUNCTIONS =======

  /**
   * Log function (เปิดใช้งานตาม config)
   */
  function log(message: string, data?: any) {
    if (config.enableLogging !== false) {
      console.log(`[${config.entityDisplayName}] ${message}`, data || '')
    }
  }

  /**
   * Get display name ของ item
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
   * Format timestamp
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

  // ======= CRUD OPERATIONS =======

  /**
   * View item - นำทางไปหน้า show
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
          toast.error('เกิดข้อผิดพลาดในการดูรายละเอียด')
        }
      })
    } catch (error) {
      log('View exception', { id: item.id, error })
      toast.error('เกิดข้อผิดพลาดในการดูรายละเอียด')
    }
  }

  /**
   * Edit item - นำทางไปหน้า edit
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
          toast.error('เกิดข้อผิดพลาดในการแก้ไข')
        }
      })
    } catch (error) {
      log('Edit exception', { id: item.id, error })
      toast.error('เกิดข้อผิดพลาดในการแก้ไข')
    }
  }

  /**
   * Delete item - ลบข้อมูล
   */
  function deleteItem(item: T, options: DeleteOptions = {}): void {
    // Merge กับ default options
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
      const confirmMessage = mergedOptions.confirmMessage ||
        config.messages?.deleteConfirm ||
        `คุณต้องการลบ${config.entityDisplayName} "${displayName}" หรือไม่?`
      
      if (!confirm(confirmMessage)) {
        log('Delete cancelled by user', { id: item.id })
        return
      }
    }

    // Set loading state
    isDeleting.value = true
    currentAction.value = 'delete'

    router.delete(route(`${config.routePrefix}.destroy`, item.id), {
      preserveScroll: mergedOptions.preserveScroll,
      preserveState: mergedOptions.preserveState,
      
      onSuccess: () => {
        isDeleting.value = false
        currentAction.value = null

        const successMessage = mergedOptions.successMessage ||
          config.messages?.deleteSuccess ||
          `ลบ${config.entityDisplayName} "${displayName}" เรียบร้อยแล้ว`
        
        log('Delete success', {
          id: item.id,
          displayName,
          timestamp: getTimestamp()
        })
        
        toast.success(successMessage)
        
        // Callback
        if (mergedOptions.onSuccess) {
          mergedOptions.onSuccess()
        }
      },
      
      onError: (errors) => {
        isDeleting.value = false
        currentAction.value = null

        const errorMessage = mergedOptions.errorMessage ||
          config.messages?.deleteError ||
          `เกิดข้อผิดพลาดในการลบ${config.entityDisplayName}`
        
        log('Delete error', {
          id: item.id,
          displayName,
          errors,
          timestamp: getTimestamp()
        })
        
        toast.error(errorMessage)
        
        // Callback
        if (mergedOptions.onError) {
          mergedOptions.onError(errors)
        }
      }
    })
  }

  /**
   * Handle custom action
   */
  async function handleCustomAction(
    actionKey: string,
    item: T,
    options: CustomActionOptions<T> = {}
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
      
      const unknownMessage = config.messages?.unknownAction || 'ไม่พบคำสั่งที่ระบุ'
      toast.error(unknownMessage)
      return
    }

    // Merge options
    const mergedOptions: CustomActionOptions<T> = {
      showLoading: true,
      confirm: false,
      ...action.defaultOptions,
      ...options
    }

    // Confirmation
    if (mergedOptions.confirm) {
      const confirmMessage = mergedOptions.confirmMessage ||
        `คุณต้องการ${action.label}หรือไม่?`
      
      if (!confirm(confirmMessage)) {
        log('Custom action cancelled by user', { actionKey, itemId: item.id })
        return
      }
    }

    // Set loading state
    if (mergedOptions.showLoading) {
      isProcessing.value = true
      currentAction.value = actionKey
      
      if (mergedOptions.loadingMessage) {
        toast.loading(mergedOptions.loadingMessage)
      }
    }

    try {
      // Transform data ถ้ามี
      const transformedItem = mergedOptions.transformData
        ? mergedOptions.transformData(item)
        : item

      // Execute handler
      const result = await action.handler(transformedItem, mergedOptions)

      // Success
      log('Custom action success', {
        actionKey,
        itemId: item.id,
        timestamp: getTimestamp()
      })

      if (mergedOptions.successMessage) {
        toast.success(mergedOptions.successMessage)
      }

      if (mergedOptions.onSuccess) {
        mergedOptions.onSuccess(item, result)
      }

    } catch (error) {
      // Error
      log('Custom action error', {
        actionKey,
        itemId: item.id,
        error,
        timestamp: getTimestamp()
      })

      const errorMessage = mergedOptions.errorMessage ||
        `เกิดข้อผิดพลาดในการ${action.label}`
      
      toast.error(errorMessage)

      if (mergedOptions.onError) {
        mergedOptions.onError(item, error)
      }

    } finally {
      // Reset loading state
      if (mergedOptions.showLoading) {
        isProcessing.value = false
        currentAction.value = null
        toast.dismiss()
      }
    }
  }

  // ======= RETURN =======
  return {
    // Operations
    viewItem,
    editItem,
    deleteItem,
    handleCustomAction,
    
    // Helpers
    getDisplayName,
    
    // State
    isDeleting,
    isProcessing,
    currentAction
  }
}
