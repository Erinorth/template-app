// ไฟล์: resources/js/pages/citizens/use.ts
import { useCrudOperations, type CustomAction } from '@/composables/useCrudOperations'
import { useExpandedContent } from '@/composables/useExpandedContent'
import { toast } from 'vue-sonner'
import { router } from '@inertiajs/vue3'
import type { Citizen } from './types'
import { CITIZEN_DISPLAY_FIELDS } from './constants'

/**
 * Composable สำหรับจัดการ Citizen operations
 */
export function useCitizens() {
  console.log('📋 useCitizens: Initializing citizen operations')

  // ======= CUSTOM ACTIONS =======

  /**
   * Custom action: สร้างบัตร
   */
  const generateCardAction: CustomAction<Citizen> = {
    key: 'generateCard',
    label: 'สร้างบัตร',
    handler: async (citizen, options) => {
      console.log('🎴 Generating card for citizen:', citizen.id)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // ตัวอย่าง: นำทางไปหน้าสร้างบัตร
      router.post(route('citizen-cards.store'), {
        citizen_id: citizen.id
      }, {
        onSuccess: () => {
          toast.success(`สร้างบัตรสำเร็จสำหรับ ${citizen.citizen_id}`)
        }
      })
    },
    defaultOptions: {
      showLoading: true,
      loadingMessage: 'กำลังสร้างบัตร...',
      confirm: true,
      confirmMessage: 'คุณต้องการสร้างบัตรประชาชนหรือไม่?'
    }
  }

  /**
   * Custom action: ดูประวัติ
   */
  const viewHistoryAction: CustomAction<Citizen> = {
    key: 'viewHistory',
    label: 'ดูประวัติ',
    handler: async (citizen) => {
      console.log('📜 Viewing history for citizen:', citizen.id)
      router.get(route('citizens.history', citizen.id))
    },
    defaultOptions: {
      showLoading: false
    }
  }

  /**
   * Custom action: พิมพ์
   */
  const printAction: CustomAction<Citizen> = {
    key: 'print',
    label: 'พิมพ์',
    handler: async (citizen) => {
      console.log('🖨️ Printing citizen:', citizen.id)
      
      // Simulate print
      window.open(route('citizens.print', citizen.id), '_blank')
      toast.success('เปิดหน้าต่างพิมพ์แล้ว')
    },
    defaultOptions: {
      showLoading: false
    }
  }

  /**
   * Custom action: ส่งออก Excel
   */
  const exportAction: CustomAction<Citizen> = {
    key: 'export',
    label: 'ส่งออก Excel',
    handler: async (citizen) => {
      console.log('📊 Exporting citizen to Excel:', citizen.id)
      
      router.get(route('citizens.export', { ids: [citizen.id] }), {}, {
        onSuccess: () => {
          toast.success('ส่งออกข้อมูลเรียบร้อยแล้ว')
        }
      })
    },
    defaultOptions: {
      showLoading: true,
      loadingMessage: 'กำลังส่งออกข้อมูล...'
    }
  }

  // ======= CRUD OPERATIONS =======

  const crud = useCrudOperations<Citizen>({
    routePrefix: 'citizens',
    entityDisplayName: 'ประชาชน',
    displayField: CITIZEN_DISPLAY_FIELDS.ID_FIELD as keyof Citizen,
    
    customActions: {
      generateCard: generateCardAction,
      viewHistory: viewHistoryAction,
      print: printAction,
      export: exportAction
    },
    
    messages: {
      deleteConfirm: 'คุณต้องการลบข้อมูลประชาชนนี้หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
      deleteSuccess: 'ลบข้อมูลประชาชนเรียบร้อยแล้ว',
      deleteError: 'เกิดข้อผิดพลาดในการลบข้อมูลประชาชน',
      unknownAction: 'ไม่พบคำสั่งที่ระบุ'
    },
    
    deleteOptions: {
      preserveScroll: true,
      preserveState: true,
      confirm: true
    },
    
    enableLogging: true
  })

  // ======= EXPANDED CONTENT =======

  // ✅ แก้ไข: ส่งเป็น object แทน array
  const { createExpandedContent } = useExpandedContent<Citizen>({
    fields: [
      { key: 'id', label: 'ID', formatter: (v: any) => `#${v}` },
      { key: 'citizen_id', label: 'เลขบัตรประชาชน', className: 'font-mono' },
      { key: 'birth_date', label: 'วันเกิด' },
      { key: 'remark', label: 'หมายเหตุ', formatter: (v: any) => v || '-' },
      { key: 'created_at', label: 'สร้างเมื่อ' },
      { key: 'updated_at', label: 'อัปเดตเมื่อ' }
    ]
  })

  // ======= EXPORTS =======

  console.log('✅ useCitizens: Citizen operations initialized', {
    customActionsCount: Object.keys(crud).length,
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
    createExpandedContent
  }
}
