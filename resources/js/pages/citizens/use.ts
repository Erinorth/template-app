/**
 * Composable สำหรับจัดการ Citizen operations
 * แยก business logic ออกจาก component เพื่อให้สามารถ reuse ได้
 */

import { useCrudOperations, type CustomAction } from '@/composables/useCrudOperations'
import { h, type Component } from 'vue'
import { toast } from 'vue-sonner'
import { router } from '@inertiajs/vue3'
import type { Citizen } from './types'
import { CITIZEN_DISPLAY_FIELDS } from './display'
import { CITIZEN_ACTIONS_UI_CONFIG, type CitizenActionUIConfig } from './actions'
import CitizenExpandedRow from './ExpandedRow.vue'

/**
 * Main composable สำหรับ Citizen operations
 * ใช้สำหรับจัดการ CRUD และ custom actions
 */
export function useCitizens() {
  console.log('[useCitizens] Initializing citizen operations')

  // สร้าง custom actions map จาก UI config
  const customActionsMap: Record<string, CustomAction<Citizen>> = {}

  // วนลูปเพื่อสร้าง action handlers
  CITIZEN_ACTIONS_UI_CONFIG.forEach((uiConfig) => {
    let handler: CustomAction<Citizen>['handler']
    let defaultOptions: CustomAction<Citizen>['defaultOptions']

    // กำหนด handler สำหรับแต่ละ action
    switch (uiConfig.key) {
      case 'generateCard':
        handler = async (citizen, options) => {
          console.log('[generateCard] Generating card for citizen:', citizen.id)
          
          // Simulate loading
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // เรียก API สร้างบัตร
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
        // Handler เริ่มต้นสำหรับ action ที่ไม่รู้จัก
        handler = async (citizen) => {
          console.warn(`[${uiConfig.key}] Unknown action`)
          toast.error(`ไม่พบการดำเนินการ "${uiConfig.label}"`)
        }
        break
    }

    // เพิ่ม action เข้า map
    customActionsMap[uiConfig.key] = {
      ...uiConfig,
      handler,
      defaultOptions
    }
  })

  // สร้าง CRUD operations
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

  /**
   * สร้าง expanded row content
   * ใช้ h() function เพื่อ render CitizenExpandedRow component
   */
  const createExpandedContent = (citizen: Citizen): Component => {
    console.log('[useCitizens] Creating expanded content for citizen:', citizen.id)
    
    return h(CitizenExpandedRow, {
      citizen: citizen
    })
  }

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
    
    // State
    isDeleting: crud.isDeleting,
    isProcessing: crud.isProcessing,
    currentAction: crud.currentAction,
    
    // Expanded content
    createExpandedContent,
    
    // Custom actions list
    customActions: Object.values(customActionsMap)
  }
}
