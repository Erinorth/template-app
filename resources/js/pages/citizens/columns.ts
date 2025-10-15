// ไฟล์: resources/js/pages/citizens/columns.ts
import type { ComputedRef } from 'vue'
import { useColumnBuilder, type ColumnConfig, type ColumnCallbacks } from '@/composables/useColumnBuilder'
import type { Citizen } from './types'
import { 
  CITIZEN_CUSTOM_ACTIONS, 
  CITIZEN_COLUMN_CLASSES,
  CITIZEN_DISPLAY_FIELDS,
} from './constants'

/**
 * สร้าง columns configuration สำหรับ Citizens table
 * พร้อมรองรับ custom actions และ responsive design
 */
export function useCitizenColumns(
  onSort: (field: string) => void,
  onView: (citizen: Citizen) => void,
  onEdit: (citizen: Citizen) => void,
  onDelete: (citizen: Citizen) => void,
  onCustomAction: (actionKey: string, citizen: Citizen) => void
) {
  
  const { createColumns } = useColumnBuilder<Citizen>()

  // กำหนด column configurations
  const columnConfigs: ColumnConfig<Citizen>[] = [
    // Column สำหรับ expand rows
    { 
      type: 'expand' 
    },
    
    // ID column (ซ่อนได้)
    {
      type: 'id',
      key: 'id',
      header: 'ID',
      sortable: true,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.ID
    },
    
    // เลขประจำตัวประชาชน (หลักและไม่สามารถซ่อนได้)
    {
      type: 'text',
      key: CITIZEN_DISPLAY_FIELDS.ID_FIELD as keyof Citizen, // เพิ่ม type assertion
      header: 'เลขประจำตัวประชาชน',
      sortable: true,
      enableHiding: false, // ไม่อนุญาตให้ซ่อน
      className: CITIZEN_COLUMN_CLASSES.CITIZEN_ID
    },
    
    // วันเกิด
    {
      type: 'date',
      key: CITIZEN_DISPLAY_FIELDS.DATE_FIELD as keyof Citizen, // เพิ่ม type assertion
      header: 'วันเกิด',
      sortable: true,
      includeTime: false,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.DATE
    },
    
    // หมายเหตุ
    {
      type: 'text',
      key: CITIZEN_DISPLAY_FIELDS.REMARK_FIELD as keyof Citizen, // เพิ่ม type assertion
      header: 'หมายเหตุ',
      sortable: true,
      maxLength: 50,
      placeholder: '-', // เพิ่ม placeholder สำหรับค่าว่าง
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.REMARK
    },
    
    // วันที่สร้าง
    {
      type: 'date',
      key: 'created_at',
      header: 'สร้างเมื่อ',
      sortable: true,
      includeTime: true,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.CREATED_AT
    },

    // Actions column
    {
      type: 'action',
      idKey: 'id',
      nameKey: CITIZEN_DISPLAY_FIELDS.ID_FIELD,
      enableCopy: true,
      enableView: true,
      enableEdit: true,
      enableDelete: true,
      enableHiding: false,
      customActions: CITIZEN_CUSTOM_ACTIONS
    }
  ]

  // Callback functions สำหรับ column actions
  const callbacks: ColumnCallbacks<Citizen> = {
    onSort,
    onView,
    onEdit,
    onDelete,
    onCustomAction
  }

  // Log สำหรับ debugging
  console.log('📋 Citizen columns: Created columns configuration', {
    totalColumns: columnConfigs.length,
    customActions: CITIZEN_CUSTOM_ACTIONS.length,
    searchableFields: Object.values(CITIZEN_DISPLAY_FIELDS)
  })

  return createColumns(columnConfigs, callbacks)
}
