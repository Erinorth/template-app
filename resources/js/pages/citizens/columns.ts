// ไฟล์: resources/js/pages/citizens/columns.ts
// คำอธิบาย: สร้าง column configuration สำหรับตาราง Citizens โดยใช้ useColumnBuilder

import { useColumnBuilder, type ColumnConfig, type ColumnCallbacks } from '@/composables/useColumnBuilder'
import type { Citizen } from './types'
import { CITIZEN_COLUMN_CLASSES, CITIZEN_DISPLAY_FIELDS } from './constants'
import { useCitizens } from './use'

/**
 * ฟังก์ชันสำหรับสร้าง columns configuration สำหรับตาราง Citizens
 * @param onSort - callback สำหรับการเรียงลำดับ
 * @param onView - callback สำหรับการดูรายละเอียด
 * @param onEdit - callback สำหรับการแก้ไข
 * @param onDelete - callback สำหรับการลบ
 * @param onCustomAction - callback สำหรับ custom actions
 * @returns computed columns สำหรับ DataTable
 */
export function useCitizenColumns(
  onSort: (field: string) => void,
  onView: (citizen: Citizen) => void,
  onEdit: (citizen: Citizen) => void,
  onDelete: (citizen: Citizen) => void,
  onCustomAction: (actionKey: string, citizen: Citizen) => void
) {
  // ดึง custom actions จาก useCitizens composable
  const { customActions } = useCitizens()
  
  // สร้าง column builder instance
  const { createColumns } = useColumnBuilder<Citizen>()

  // แปลง customActions ให้ตรงกับ type ของ DataTableDropdown
  // โดยกรอง variant ที่ไม่รองรับออก (outline, secondary, link)
  const filteredCustomActions = customActions.map((action) => {
    // กรอง variant ให้เหลือเฉพาะ 'default' | 'destructive' | 'ghost'
    let variant: 'default' | 'destructive' | 'ghost' = 'default'
    
    if (action.variant === 'destructive') {
      variant = 'destructive'
    } else if (action.variant === 'ghost') {
      variant = 'ghost'
    }
    
    return {
      key: action.key,
      label: action.label,
      icon: action.icon,
      variant: variant, // ใช้ variant ที่กรองแล้ว
      className: action.className,
      disabled: action.disabled,
      visible: action.visible,
      separator: action.separator
    }
  })

  // กำหนด column configurations
  const columnConfigs: ColumnConfig[] = [
    // Expand Column - สำหรับแสดงข้อมูลเพิ่มเติม
    { type: 'expand' },
    
    // ID Column - แสดง ID หลัก
    {
      type: 'id',
      key: 'id' as string,
      header: 'ID',
      sortable: true,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.ID
    },
    
    // Citizen ID Column - เลขบัตรประชาชน (คอลัมน์หลัก)
    {
      type: 'text',
      key: CITIZEN_DISPLAY_FIELDS.ID_FIELD as string,
      header: 'เลขบัตรประชาชน',
      sortable: true,
      enableHiding: false,
      className: CITIZEN_COLUMN_CLASSES.CITIZEN_ID
    },
    
    // Birth Date Column - วันเกิด
    {
      type: 'date',
      key: CITIZEN_DISPLAY_FIELDS.DATE_FIELD as string,
      header: 'วันเกิด',
      sortable: true,
      includeTime: false,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.DATE
    },
    
    // Remark Column - หมายเหตุ
    {
      type: 'text',
      key: CITIZEN_DISPLAY_FIELDS.REMARK_FIELD as string,
      header: 'หมายเหตุ',
      sortable: true,
      maxLength: 50,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.REMARK
    },
    
    // Created At Column - วันที่สร้าง
    {
      type: 'date',
      key: 'created_at' as string,
      header: 'สร้างเมื่อ',
      sortable: true,
      includeTime: true,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.CREATED_AT
    },
    
    // Action Column - ปุ่ม Actions dropdown
    {
      type: 'action',
      idKey: 'id' as string,
      nameKey: CITIZEN_DISPLAY_FIELDS.ID_FIELD as string,
      enableCopy: true,
      enableView: true,
      enableEdit: true,
      enableDelete: true,
      enableHiding: false,
      customActions: filteredCustomActions // ใช้ customActions ที่กรองแล้ว
    }
  ]

  // กำหนด callbacks สำหรับ column actions
  const callbacks: ColumnCallbacks<Citizen> = {
    onSort,
    onView,
    onEdit,
    onDelete,
    onCustomAction
  }

  console.log('[Citizen columns] Created columns configuration', {
    totalColumns: columnConfigs.length,
    customActions: filteredCustomActions.length,
    searchableFields: Object.values(CITIZEN_DISPLAY_FIELDS)
  })

  return createColumns(columnConfigs, callbacks)
}
