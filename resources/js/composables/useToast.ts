import { toast } from 'vue-sonner'
import type { ToastConfig } from '@/types/table'

/**
 * Universal toast composable สำหรับจัดการข้อความแจ้งเตือนทั้งระบบ
 * ให้ข้อความเป็นไปตามมาตรฐานเดียวกัน และสามารถปรับแต่งได้ง่าย
 */
export function useToast() {
  
  // ข้อความมาตรฐานสำหรับการดำเนินการต่างๆ
  const defaultMessages = {
    sort: {
      success: (column: string, direction: string) => 
        `เรียงข้อมูลโดย ${column} (${direction === 'asc' ? 'น้อยไปมาก' : 'มากไปน้อย'})`,
      error: 'เกิดข้อผิดพลาดในการเรียงข้อมูล'
    },
    filter: {
      applied: (field: string, value: string) => `กรองข้อมูล ${field}: ${value}`,
      cleared: (field: string) => `ยกเลิกการกรอง ${field}`,
      error: 'เกิดข้อผิดพลาดในการกรองข้อมูล'
    },
    pagination: {
      changed: (page: number, total: number) => `เปลี่ยนไปหน้าที่ ${page} จาก ${total}`,
      sizeChanged: (size: number) => `แสดง ${size} รายการต่อหน้า`,
      error: 'เกิดข้อผิดพลาดในการเปลี่ยนหน้า'
    },
    permission: {
      updated: (user: string, permission: string, status: boolean) =>
        `อัปเดตสิทธิ์ ${permission} ของ ${user}: ${status ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}`,
      error: (user: string, permission: string) => 
        `ไม่สามารถอัปเดตสิทธิ์ ${permission} ของ ${user} ได้`
    },
    data: {
      loaded: 'โหลดข้อมูลเรียบร้อยแล้ว',
      loading: 'กำลังโหลดข้อมูล...',
      error: 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      saved: 'บันทึกข้อมูลเรียบร้อยแล้ว',
      deleted: 'ลบข้อมูลเรียบร้อยแล้ว'
    }
  }

  // ฟังก์ชันสำหรับการเรียงข้อมูล
  const sortToast = {
    success: (column: string, direction: string) => 
      toast.success(defaultMessages.sort.success(column, direction)),
    error: (error?: string) => 
      toast.error(error || defaultMessages.sort.error)
  }

  // ฟังก์ชันสำหรับการกรองข้อมูล
  const filterToast = {
    applied: (field: string, value: string) => 
      toast.success(defaultMessages.filter.applied(field, value)),
    cleared: (field: string) => 
      toast.info(defaultMessages.filter.cleared(field)),
    error: (error?: string) => 
      toast.error(error || defaultMessages.filter.error)
  }

  // ฟังก์ชันสำหรับ pagination
  const paginationToast = {
    changed: (page: number, total: number) => 
      toast.info(defaultMessages.pagination.changed(page, total)),
    sizeChanged: (size: number) => 
      toast.info(defaultMessages.pagination.sizeChanged(size)),
    error: (error?: string) => 
      toast.error(error || defaultMessages.pagination.error)
  }

  // ฟังก์ชันสำหรับการจัดการสิทธิ์
  const permissionToast = {
    updated: (user: string, permission: string, status: boolean) => 
      toast.success(defaultMessages.permission.updated(user, permission, status)),
    error: (user: string, permission: string, error?: string) => 
      toast.error(error || defaultMessages.permission.error(user, permission))
  }

  // ฟังก์ชันสำหรับการจัดการข้อมูลทั่วไป
  const dataToast = {
    loaded: () => toast.success(defaultMessages.data.loaded),
    loading: () => toast.loading(defaultMessages.data.loading),
    error: (error?: string) => toast.error(error || defaultMessages.data.error),
    saved: () => toast.success(defaultMessages.data.saved),
    deleted: () => toast.success(defaultMessages.data.deleted)
  }

  return {
    sortToast,
    filterToast,
    paginationToast,
    permissionToast,
    dataToast,
    // เพื่อความยืดหยุ่นในการใช้งาน
    toast
  }
}
