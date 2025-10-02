import { useCrudOperations } from '@/composables/useCrudOperations'
import { useExpandedContent } from '@/composables/useExpandedContent'
import { toast } from 'vue-sonner'
import type { Citizen, CitizenActionKey } from './types'

export function useCitizens() {
  // กำหนดค่า CRUD operations สำหรับ Citizens
  const crudConfig = {
    routePrefix: 'citizens',
    entityDisplayName: 'ข้อมูลประชาชน',
    displayField: 'citizen_id' as keyof Citizen,
    customActions: {
      print: {
        label: 'พิมพ์',
        handler: async (citizen: Citizen) => {
          const displayName = citizen.citizen_id || `ID: ${citizen.id}`
          console.log('Printing citizen data:', { id: citizen.id, citizen_id: citizen.citizen_id })
          toast.info(`กำลังพิมพ์ข้อมูล ${displayName}`)
          // TODO: เพิ่มการพิมพ์จริง
        }
      },
      export: {
        label: 'ส่งออก',
        handler: async (citizen: Citizen) => {
          const displayName = citizen.citizen_id || `ID: ${citizen.id}`
          console.log('Exporting citizen data:', { id: citizen.id, citizen_id: citizen.citizen_id })
          toast.info(`กำลังส่งออกข้อมูล ${displayName}`)
          // TODO: เพิ่มการส่งออกจริง
        }
      },
      generateCard: {
        label: 'สร้างบัตร',
        handler: async (citizen: Citizen) => {
          const displayName = citizen.citizen_id || `ID: ${citizen.id}`
          console.log('Generating card for citizen:', { id: citizen.id, citizen_id: citizen.citizen_id })
          toast.info(`กำลังสร้างบัตรสำหรับ ${displayName}`)
          // TODO: เพิ่มการสร้างบัตรจริง
        }
      },
      viewHistory: {
        label: 'ดูประวัติ',
        handler: async (citizen: Citizen) => {
          const displayName = citizen.citizen_id || `ID: ${citizen.id}`
          console.log('Viewing citizen history:', { id: citizen.id, citizen_id: citizen.citizen_id })
          toast.info(`กำลังเปิดประวัติของ ${displayName}`)
          // TODO: เพิ่มการดูประวัติจริง
        }
      }
    },
    messages: {
      deleteConfirm: 'คุณต้องการลบข้อมูลประชาชนนี้หรือไม่?',
      deleteSuccess: 'ลบข้อมูลประชาชนเรียบร้อยแล้ว',
      deleteError: 'เกิดข้อผิดพลาดในการลบข้อมูลประชาชน'
    }
  }

  // ใช้ generic CRUD operations
  const { 
    viewItem: viewCitizen, 
    editItem: editCitizen, 
    deleteItem: deleteCitizen, 
    handleCustomAction 
  } = useCrudOperations<Citizen>(crudConfig)

  // กำหนดค่าสำหรับ expanded content พร้อม formatter
  const expandedConfig = {
    fields: [
      { 
        key: 'citizen_id' as keyof Citizen, 
        label: 'รหัสประชาชน',
        formatter: (value: string | null) => value || 'ไม่มีรหัส'
      },
      { 
        key: 'birth_date' as keyof Citizen, 
        label: 'วันเกิด',
        formatter: (value: string | null) => {
          if (!value) return 'ไม่ระบุ'
          return new Date(value).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
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
          return new Date(value).toLocaleString('th-TH')
        }
      },
      { 
        key: 'updated_at' as keyof Citizen, 
        label: 'อัปเดตเมื่อ',
        formatter: (value: string | null) => {
          if (!value) return 'ไม่เคยอัปเดต'
          return new Date(value).toLocaleString('th-TH')
        }
      },
      { 
        key: 'id' as keyof Citizen, 
        label: 'รหัสระบบ',
        formatter: (value: number | string) => `#${value}`
      }
    ]
  }

  // ใช้ generic expanded content
  const { createExpandedContent } = useExpandedContent<Citizen>(expandedConfig)

  // Wrapper function สำหรับ custom action เพื่อให้เข้ากับ type เดิม
  const handleCitizenCustomAction = (actionKey: CitizenActionKey, citizen: Citizen) => {
    console.log('Handling citizen custom action:', { actionKey, citizenId: citizen.id })
    return handleCustomAction(actionKey, citizen)
  }

  return {
    // CRUD operations
    viewCitizen,
    editCitizen,
    deleteCitizen,
    handleCustomAction: handleCitizenCustomAction,
    // Expanded content
    createExpandedContent
  }
}
