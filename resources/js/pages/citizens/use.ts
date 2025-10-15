// ไฟล์: resources/js/pages/citizens/use.ts
// คำอธิบาย: Composable สำหรับจัดการ operations และ business logic ของ Citizens

import { useCrudOperations, type CustomAction } from '@/composables/useCrudOperations'
import { useExpandedContent } from '@/composables/useExpandedContent'
import { toast } from 'vue-sonner'
import { router } from '@inertiajs/vue3'
import type { Citizen } from './types'
import { CITIZEN_DISPLAY_FIELDS, CITIZEN_ACTIONS_UI_CONFIG } from './constants'

/**
 * Composable สำหรับจัดการ operations ของ Citizens
 * @returns Object ที่ประกอบด้วย CRUD operations และ helper functions
 */
export function useCitizens() {
  console.log('[useCitizens] Initializing citizen operations')

  // สร้าง custom actions map จาก UI config
  const customActionsMap: Record<string, CustomAction<Citizen>> = {}

  // วนลูปสร้าง custom actions จาก configuration
  CITIZEN_ACTIONS_UI_CONFIG.forEach((uiConfig) => {
    let handler: CustomAction<Citizen>['handler']
    let defaultOptions: CustomAction<Citizen>['defaultOptions']

    // กำหนด handler ตาม action key
    switch (uiConfig.key) {
      case 'generateCard':
        handler = async (citizen, options) => {
          console.log('[generateCard] Generating card for citizen:', citizen.id)
          
          // จำลองการประมวลผล
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // ส่งคำขอสร้างบัตร
          router.post(
            route('citizen-cards.store'),
            { citizen_id: citizen.id },
            {
              onSuccess: () => {
                toast.success(`สร้างบัตรสำหรับ ${citizen.citizen_id} สำเร็จ`)
              },
              onError: () => {
                toast.error('ไม่สามารถสร้างบัตรได้')
              }
            }
          )
        }
        defaultOptions = {
          showLoading: true,
          loadingMessage: 'กำลังสร้างบัตร...',
          confirm: true,
          confirmMessage: 'คุณต้องการสร้างบัตรใช่หรือไม่?'
        }
        break

      case 'viewHistory':
        handler = async (citizen) => {
          console.log('[viewHistory] Viewing history for citizen:', citizen.id)
          router.get(route('citizens.history', citizen.id))
        }
        defaultOptions = {
          showLoading: false
        }
        break

      case 'print':
        handler = async (citizen) => {
          console.log('[print] Printing citizen:', citizen.id)
          window.open(route('citizens.print', citizen.id), '_blank')
          toast.success('เปิดหน้าต่างพิมพ์')
        }
        defaultOptions = {
          showLoading: false
        }
        break

      case 'export':
        handler = async (citizen) => {
          console.log('[export] Exporting citizen to Excel:', citizen.id)
          router.get(
            route('citizens.export'),
            { ids: [citizen.id] },
            {
              onSuccess: () => {
                toast.success('ส่งออกข้อมูลสำเร็จ')
              },
              onError: () => {
                toast.error('ไม่สามารถส่งออกข้อมูลได้')
              }
            }
          )
        }
        defaultOptions = {
          showLoading: true,
          loadingMessage: 'กำลังส่งออกข้อมูล...'
        }
        break

      default:
        // กรณีที่ไม่รู้จัก action
        handler = async (citizen) => {
          console.warn(`[${uiConfig.key}] Unknown action`)
          toast.error(`ไม่พบการดำเนินการ "${uiConfig.label}"`)
        }
        break
    }

    // เพิ่ม action เข้าไปใน map
    customActionsMap[uiConfig.key] = {
      ...uiConfig,
      handler,
      defaultOptions
    }
  })

  // สร้าง CRUD operations instance
  const crud = useCrudOperations<Citizen>({
    routePrefix: 'citizens',
    entityDisplayName: 'ประชากร',
    displayField: CITIZEN_DISPLAY_FIELDS.ID_FIELD as keyof Citizen,
    customActions: customActionsMap,
    messages: {
      deleteConfirm: 'คุณต้องการลบประชากรนี้หรือไม่?',
      deleteSuccess: 'ลบประชากรสำเร็จ',
      deleteError: 'ไม่สามารถลบประชากรได้',
      unknownAction: 'ไม่พบคำสั่งที่ระบุ'
    },
    deleteOptions: {
      preserveScroll: true,
      preserveState: true,
      confirm: true
    },
    enableLogging: true
  })

  // สร้าง expanded content helper
  const { createExpandedContent } = useExpandedContent<Citizen>({
    fields: [
      { key: 'id', label: 'ID', formatter: (v: any) => v },
      { 
        key: 'citizen_id', 
        label: 'เลขบัตรประชาชน'
        // ลบ className ออกเนื่องจาก type ไม่รองรับ
      },
      { key: 'birth_date', label: 'วันเกิด' },
      { key: 'remark', label: 'หมายเหตุ', formatter: (v: any) => v || '-' },
      { key: 'created_at', label: 'สร้างเมื่อ' },
      { key: 'updated_at', label: 'แก้ไขเมื่อ' }
    ]
  })

  console.log('[useCitizens] Citizen operations initialized', {
    customActionsCount: Object.keys(customActionsMap).length,
    enabledLogging: true
  })

  return {
    // CRUD operations
    viewCitizen: crud.viewItem,
    editCitizen: crud.editItem,
    deleteCitizen: crud.deleteItem,
    handleCustomAction: crud.handleCustomAction,
    getDisplayName: crud.getDisplayName,
    
    // State flags
    isDeleting: crud.isDeleting,
    isProcessing: crud.isProcessing,
    currentAction: crud.currentAction,
    
    // Helper functions
    createExpandedContent,
    
    // Custom actions array
    customActions: Object.values(customActionsMap)
  }
}
