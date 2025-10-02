// resources/js/pages/citizens/useCitizens.ts
import { router } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import type { Citizen, CitizenActionKey } from './types'

/**
 * Composable สำหรับการจัดการข้อมูลประชาชน
 * รวบรวม logic ทั้งหมดที่เกี่ยวข้องกับ citizen operations
 */
export function useCitizens() {
  /**
   * ฟังก์ชันดูข้อมูลประชาชน
   */
  function viewCitizen(citizen: Citizen) {
    console.log('View citizen:', citizen)
    router.get(route('citizens.show', citizen.id))
  }

  /**
   * ฟังก์ชันแก้ไขข้อมูลประชาชน
   */
  function editCitizen(citizen: Citizen) {
    console.log('Edit citizen:', citizen)
    router.get(route('citizens.edit', citizen.id))
  }

  /**
   * ฟังก์ชันลบข้อมูลประชาชน
   */
  function deleteCitizen(citizen: Citizen) {
    console.log('Delete citizen:', citizen)
    
    const citizenId = citizen.citizen_id || `ID: ${citizen.id}`
    
    if (confirm(`คุณต้องการลบข้อมูลประชาชน ${citizenId} หรือไม่?`)) {
      router.delete(route('citizens.destroy', citizen.id), {
        onSuccess: () => {
          toast.success('ลบข้อมูลเรียบร้อยแล้ว')
        },
        onError: (errors) => {
          console.error('Delete citizen error:', errors)
          toast.error('เกิดข้อผิดพลาดในการลบข้อมูล')
        }
      })
    }
  }

  /**
   * ฟังก์ชันจัดการ custom actions
   */
  function handleCustomAction(actionKey: CitizenActionKey, citizen: Citizen) {
    console.log('Custom action:', actionKey, citizen)
    
    const citizenId = citizen.citizen_id || `ID: ${citizen.id}`
    
    switch (actionKey) {
      case 'print':
        // Logic สำหรับพิมพ์
        toast.info(`กำลังพิมพ์ข้อมูล ${citizenId}`)
        // เรียก API สำหรับพิมพ์
        // router.post(route('citizens.print', citizen.id))
        break
        
      case 'export':
        // Logic สำหรับส่งออก
        toast.info(`กำลังส่งออกข้อมูล ${citizenId}`)
        // เรียก API สำหรับส่งออก Excel
        // window.open(route('citizens.export', citizen.id))
        break
        
      case 'generateCard':
        // Logic เฉพาะการสร้างบัตรประชาชน
        toast.info(`กำลังสร้างบัตรสำหรับ ${citizenId}`)
        // router.post(route('citizen-cards.generate', citizen.id))
        break
        
      case 'viewHistory':
        // Logic เฉพาะการดูประวัติ
        toast.info(`กำลังเปิดประวัติของ ${citizenId}`)
        // router.get(route('citizens.history', citizen.id))
        break
        
      default:
        console.warn('Unknown action:', actionKey)
        toast.error('ไม่พบคำสั่งที่ระบุ')
    }
  }

  /**
   * ฟังก์ชันสร้างเนื้อหาสำหรับ expanded row
   */
  function createExpandedContent(citizen: Citizen): string {
    return `รหัสประชาชน: ${citizen.citizen_id || 'ไม่มีข้อมูล'}
วันเกิด: ${citizen.birth_date || 'ไม่มีข้อมูล'}
หมายเหตุ: ${citizen.remark || 'ไม่มี'}
สร้างเมื่อ: ${citizen.created_at || 'ไม่มีข้อมูล'}
อัปเดตเมื่อ: ${citizen.updated_at || 'ไม่มีข้อมูล'}
รหัสระบบ: ${citizen.id}`
  }

  return {
    // Actions
    viewCitizen,
    editCitizen,
    deleteCitizen,
    handleCustomAction,
    // Utilities
    createExpandedContent
  }
}
