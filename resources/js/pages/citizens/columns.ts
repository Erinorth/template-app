/**
 * ไฟล์: resources/js/pages/citizens/columns.ts
 * คำอธิบาย: สร้าง columns configuration สำหรับตาราง citizens
 */

import { useColumnBuilder, type ColumnConfig, type ColumnCallbacks } from '@/composables/useColumnBuilder'
import type { Citizen } from './types'
import { 
  CITIZEN_CUSTOM_ACTIONS, 
  CITIZEN_COLUMN_CLASSES,
  CITIZEN_DISPLAY_FIELDS,
} from './constants'

/**
 * Hook สำหรับสร้าง columns configuration สำหรับตาราง citizens
 * @param onSort - callback เมื่อมีการเรียงลำดับ
 * @param onView - callback เมื่อกดดูข้อมูล
 * @param onEdit - callback เมื่อกดแก้ไข
 * @param onDelete - callback เมื่อกดลบ
 * @param onCustomAction - callback เมื่อกด custom action
 * @returns columns configuration
 */
export function useCitizenColumns(
  onSort: (field: string) => void,
  onView: (citizen: Citizen) => void,
  onEdit: (citizen: Citizen) => void,
  onDelete: (citizen: Citizen) => void,
  onCustomAction: (actionKey: string, citizen: Citizen) => void
) {
  // สร้าง column builder
  const { createColumns } = useColumnBuilder<Citizen>()

  // กำหนดค่า column configurations
  const columnConfigs: ColumnConfig[] = [
    // Expand column สำหรับแสดงรายละเอียดเพิ่มเติม
    { 
      type: 'expand' 
    },
    
    // ID column
    {
      type: 'id',
      key: 'id' as string,
      header: 'ID',
      sortable: true,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.ID
    },
    
    // เลขบัตรประชาชน
    {
      type: 'text',
      key: CITIZEN_DISPLAY_FIELDS.ID_FIELD as string,
      header: 'เลขประจำตัวประชาชน',
      sortable: true,
      enableHiding: false, // ห้ามซ่อน column นี้
      className: CITIZEN_COLUMN_CLASSES.CITIZEN_ID
    },
    
    // วันเกิด
    {
      type: 'date',
      key: CITIZEN_DISPLAY_FIELDS.DATE_FIELD as string,
      header: 'วันเกิด',
      sortable: true,
      includeTime: false,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.DATE
    },
    
    // หมายเหตุ - ลบ placeholder ออก
    {
      type: 'text',
      key: CITIZEN_DISPLAY_FIELDS.REMARK_FIELD as string,
      header: 'หมายเหตุ',
      sortable: true,
      maxLength: 50,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.REMARK
    },
    
    // วันที่สร้าง
    {
      type: 'date',
      key: 'created_at' as string,
      header: 'สร้างเมื่อ',
      sortable: true,
      includeTime: true,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.CREATED_AT
    },

    // Action column
    {
      type: 'action',
      idKey: 'id' as string,
      nameKey: CITIZEN_DISPLAY_FIELDS.ID_FIELD as string,
      enableCopy: true,
      enableView: true,
      enableEdit: true,
      enableDelete: true,
      enableHiding: false,
      customActions: CITIZEN_CUSTOM_ACTIONS
    }
  ]

  // กำหนดค่า callbacks
  const callbacks: ColumnCallbacks<Citizen> = {
    onSort,
    onView,
    onEdit,
    onDelete,
    onCustomAction
  }

  // Log เพื่อตรวจสอบ
  console.log('📋 Citizen columns: Created columns configuration', {
    totalColumns: columnConfigs.length,
    customActions: CITIZEN_CUSTOM_ACTIONS.length,
    searchableFields: Object.values(CITIZEN_DISPLAY_FIELDS)
  })

  // สร้างและ return columns
  return createColumns(columnConfigs, callbacks)
}
