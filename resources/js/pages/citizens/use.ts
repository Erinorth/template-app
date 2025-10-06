// resources/js/pages/citizens/useCitizens.ts

import { useCrudOperations } from '@/composables/useCrudOperations'
import { useExpandedContent } from '@/composables/useExpandedContent'
import { toast } from 'vue-sonner'
import { router } from '@inertiajs/vue3'
import type { Citizen, CitizenActionKey } from './types'
import { CITIZEN_CUSTOM_ACTIONS, CITIZEN_DISPLAY_FIELDS } from './constants'

/**
 * Composable สำหรับจัดการ Citizens
 * รวมฟังก์ชัน CRUD และ custom actions ต่างๆ
 */
export function useCitizens() {
  
  // Configuration สำหรับ CRUD operations
  const crudConfig = {
    routePrefix: 'citizens',
    entityDisplayName: 'ข้อมูลประชาชน',
    displayField: CITIZEN_DISPLAY_FIELDS.ID_FIELD,
    customActions: {
      // Action สำหรับพิมพ์ข้อมูล
      print: {
        label: 'พิมพ์',
        handler: async (citizen: Citizen) => {
          const displayName = citizen.citizen_id || `ID: ${citizen.id}`
          
          try {
            console.log('Printing citizen data:', { 
              id: citizen.id, 
              citizen_id: citizen.citizen_id 
            })
            
            // TODO: เพิ่ม API call สำหรับสร้าง PDF
            toast.success(`กำลังเตรียมไฟล์พิมพ์สำหรับ ${displayName}`)
            
            // สมมติว่ามี route สำหรับ download PDF
            // window.open(route('citizens.print', citizen.id), '_blank')
            
          } catch (error) {
            console.error('Print error:', error)
            toast.error('เกิดข้อผิดพลาดในการพิมพ์')
          }
        }
      },
      
      // Action สำหรับส่งออกข้อมูล
      export: {
        label: 'ส่งออก',
        handler: async (citizen: Citizen) => {
          const displayName = citizen.citizen_id || `ID: ${citizen.id}`
          
          try {
            console.log('Exporting citizen data:', { 
              id: citizen.id, 
              citizen_id: citizen.citizen_id 
            })
            
            toast.success(`กำลังเตรียมไฟล์ส่งออกสำหรับ ${displayName}`)
            
            // TODO: เพิ่ม API call สำหรับ export Excel
            // router.visit(route('citizens.export', { ids: [citizen.id] }))
            
          } catch (error) {
            console.error('Export error:', error)
            toast.error('เกิดข้อผิดพลาดในการส่งออก')
          }
        }
      },
      
      // Action สำหรับสร้างบัตรประชาชน
      generateCard: {
        label: 'สร้างบัตร',
        handler: async (citizen: Citizen) => {
          const displayName = citizen.citizen_id || `ID: ${citizen.id}`
          
          try {
            console.log('Generating card for citizen:', { 
              id: citizen.id, 
              citizen_id: citizen.citizen_id 
            })
            
            toast.success(`กำลังสร้างบัตรสำหรับ ${displayName}`)
            
            // TODO: เชื่อมต่อกับ CitizenCard module
            // router.visit(route('citizen-cards.create', { citizen_id: citizen.id }))
            
          } catch (error) {
            console.error('Card generation error:', error)
            toast.error('เกิดข้อผิดพลาดในการสร้างบัตร')
          }
        }
      },
      
      // Action สำหรับดูประวัติ
      viewHistory: {
        label: 'ดูประวัติ',
        handler: async (citizen: Citizen) => {
          const displayName = citizen.citizen_id || `ID: ${citizen.id}`
          
          try {
            console.log('Viewing citizen history:', { 
              id: citizen.id, 
              citizen_id: citizen.citizen_id 
            })
            
            toast.info(`กำลังเปิดประวัติของ ${displayName}`)
            
            // TODO: เพิ่ม route สำหรับดูประวัติ
            // router.visit(route('citizens.history', citizen.id))
            
          } catch (error) {
            console.error('History view error:', error)
            toast.error('เกิดข้อผิดพลาดในการเปิดประวัติ')
          }
        }
      }
    },
    
    // Custom messages
    messages: {
      deleteConfirm: 'คุณต้องการลบข้อมูลประชาชนนี้หรือไม่? การลบจะไม่สามารถยกเลิกได้',
      deleteSuccess: 'ลบข้อมูลประชาชนเรียบร้อยแล้ว',
      deleteError: 'เกิดข้อผิดพลาดในการลบข้อมูลประชาชน กรุณาลองใหม่อีกครั้ง'
    }
  }

  // ใช้ CRUD operations
  const { 
    viewItem: viewCitizen, 
    editItem: editCitizen, 
    deleteItem: deleteCitizen, 
    handleCustomAction 
  } = useCrudOperations<Citizen>(crudConfig)

  // Configuration สำหรับ expanded content
  const expandedConfig = {
    fields: [
      { 
        key: 'citizen_id' as keyof Citizen, 
        label: 'รหัสประชาชน',
        formatter: (value: string | null) => {
          if (!value) return 'ไม่มีรหัส'
          // เพิ่มการจัดรูปแบบเลขประชาชน
          return value.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5')
        }
      },
      { 
        key: 'birth_date' as keyof Citizen, 
        label: 'วันเกิด',
        formatter: (value: string | null) => {
          if (!value) return 'ไม่ระบุ'
          
          const date = new Date(value)
          const today = new Date()
          const age = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
          
          return `${date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} (อายุ ${age} ปี)`
        }
      },
      { 
        key: 'remark' as keyof Citizen, 
        label: 'หมายเหตุ',
        formatter: (value: string | null) => value || 'ไม่มีหมายเหตุ'
      },
      { 
        key: 'created_at' as keyof Citizen, 
        label: 'สร้างเมื่อ',
        formatter: (value: string | null) => {
          if (!value) return 'ไม่ระบุ'
          return new Date(value).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      },
      { 
        key: 'updated_at' as keyof Citizen, 
        label: 'อัปเดตเมื่อ',
        formatter: (value: string | null) => {
          if (!value) return 'ไม่เคยอัปเดต'
          return new Date(value).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      },
      { 
        key: 'id' as keyof Citizen, 
        label: 'รหัสระบบ',
        formatter: (value: number | string) => `#${String(value).padStart(6, '0')}`
      }
    ]
  }

  // ใช้ expanded content
  const { createExpandedContent } = useExpandedContent<Citizen>(expandedConfig)

  // Wrapper สำหรับ custom action handling พร้อม type safety
  const handleCitizenCustomAction = (actionKey: CitizenActionKey, citizen: Citizen) => {
    console.log('Handling citizen custom action:', { 
      actionKey, 
      citizenId: citizen.id,
      timestamp: new Date().toISOString()
    })
    
    return handleCustomAction(actionKey, citizen)
  }

  // Log สำหรับ debugging
  console.log('Citizens composable: Initialized with', {
    customActionsCount: Object.keys(crudConfig.customActions).length,
    expandedFieldsCount: expandedConfig.fields.length
  })

  return {
    // CRUD operations
    viewCitizen,
    editCitizen,
    deleteCitizen,
    handleCustomAction: handleCitizenCustomAction,
    
    // Expanded content
    createExpandedContent,
    
    // Constants (สำหรับใช้ในที่อื่นได้)
    CITIZEN_ACTIONS: CITIZEN_CUSTOM_ACTIONS
  }
}
