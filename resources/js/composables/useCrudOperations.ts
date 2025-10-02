import { router } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'

// Generic interface สำหรับข้อมูลพื้นฐาน - แก้ไขให้รองรับ null
export interface BaseEntity {
  id: number | string
  created_at?: string | null  // เปลี่ยนจาก string | undefined
  updated_at?: string | null  // เปลี่ยนจาก string | undefined
  [key: string]: any
}

// Configuration interface สำหรับ CRUD operations
export interface CrudConfig<T extends BaseEntity> {
  // ชื่อ route หลัก (เช่น 'citizens', 'users', 'products')
  routePrefix: string
  // ชื่อแสดงผลสำหรับ entity (เช่น 'ประชาชน', 'ผู้ใช้งาน', 'สินค้า')
  entityDisplayName: string
  // ฟิลด์ที่ใช้แสดงชื่อในการยืนยันการลบ (เช่น 'citizen_id', 'name', 'title')
  displayField?: keyof T | ((item: T) => string)
  // Custom actions เพิ่มเติม
  customActions?: Record<string, {
    label: string
    handler: (item: T) => void | Promise<void>
  }>
  // การกำหนดค่าข้อความ
  messages?: {
    deleteConfirm?: string
    deleteSuccess?: string
    deleteError?: string
    unknownAction?: string
  }
}

// Generic composable สำหรับ CRUD operations
export function useCrudOperations<T extends BaseEntity>(config: CrudConfig<T>) {
  // ดึงชื่อแสดงผลจาก entity
  const getDisplayName = (item: T): string => {
    if (!config.displayField) {
      return `ID: ${item.id}`
    }
    
    if (typeof config.displayField === 'function') {
      return config.displayField(item)
    }
    
    const fieldValue = item[config.displayField]
    return fieldValue || `ID: ${item.id}`
  }

  // View operation - ดูรายละเอียด
  const viewItem = (item: T): void => {
    console.log(`View ${config.entityDisplayName.toLowerCase()}:`, { 
      id: item.id, 
      displayField: config.displayField, 
      timestamp: new Date().toLocaleString('th-TH') 
    })
    router.get(route(`${config.routePrefix}.show`, item.id))
  }

  // Edit operation - แก้ไขข้อมูล
  const editItem = (item: T): void => {
    console.log(`Edit ${config.entityDisplayName.toLowerCase()}:`, { 
      id: item.id, 
      displayField: config.displayField, 
      timestamp: new Date().toLocaleString('th-TH') 
    })
    router.get(route(`${config.routePrefix}.edit`, item.id))
  }

  // Delete operation - ลบข้อมูล
  const deleteItem = (item: T): void => {
    console.log(`Delete ${config.entityDisplayName.toLowerCase()}:`, { 
      id: item.id, 
      displayField: config.displayField, 
      timestamp: new Date().toLocaleString('th-TH') 
    })
    
    const displayName = getDisplayName(item)
    const confirmMessage = config.messages?.deleteConfirm || 
      `คุณต้องการลบ${config.entityDisplayName} ${displayName} หรือไม่?`
    
    if (confirm(confirmMessage)) {
      router.delete(route(`${config.routePrefix}.destroy`, item.id), {
        onSuccess: () => {
          const successMessage = config.messages?.deleteSuccess || 
            `ลบ${config.entityDisplayName}เรียบร้อยแล้ว`
          console.log(`Delete success:`, { 
            id: item.id, 
            displayName, 
            timestamp: new Date().toLocaleString('th-TH') 
          })
          toast.success(successMessage)
        },
        onError: (errors) => {
          console.error(`Delete ${config.entityDisplayName.toLowerCase()} error:`, { 
            id: item.id, 
            displayName, 
            errors, 
            timestamp: new Date().toLocaleString('th-TH') 
          })
          const errorMessage = config.messages?.deleteError || 
            `เกิดข้อผิดพลาดในการลบ${config.entityDisplayName}`
          toast.error(errorMessage)
        }
      })
    }
  }

  // Handle custom actions - จัดการ actions พิเศษ
  const handleCustomAction = async (actionKey: string, item: T): Promise<void> => {
    console.log('Custom action initiated:', { 
      actionKey, 
      itemId: item.id, 
      entity: config.entityDisplayName, 
      timestamp: new Date().toLocaleString('th-TH') 
    })
    
    const displayName = getDisplayName(item)
    const customAction = config.customActions?.[actionKey]
    
    if (customAction) {
      try {
        await customAction.handler(item)
        console.log('Custom action completed:', { 
          actionKey, 
          itemId: item.id, 
          success: true, 
          timestamp: new Date().toLocaleString('th-TH') 
        })
      } catch (error) {
        console.error(`Custom action ${actionKey} error:`, { 
          itemId: item.id, 
          displayName, 
          error, 
          timestamp: new Date().toLocaleString('th-TH') 
        })
        toast.error(`เกิดข้อผิดพลาดในการดำเนินการ ${customAction.label}`)
      }
    } else {
      console.warn('Unknown action attempted:', { 
        actionKey, 
        itemId: item.id, 
        availableActions: Object.keys(config.customActions || {}), 
        timestamp: new Date().toLocaleString('th-TH') 
      })
      const unknownMessage = config.messages?.unknownAction || 'ไม่พบคำสั่งที่ระบุ'
      toast.error(unknownMessage)
    }
  }

  return {
    viewItem,
    editItem, 
    deleteItem,
    handleCustomAction,
    getDisplayName
  }
}
