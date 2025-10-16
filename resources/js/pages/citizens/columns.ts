// resources/js/pages/citizens/columns.ts
import { useColumnBuilder, type ColumnConfig, type ColumnCallbacks } from '@/composables/useColumnBuilder'
import type { Citizen } from './types'
import { CITIZEN_COLUMN_CLASSES, CITIZEN_DISPLAY_FIELDS } from './display'
import { useCitizens } from './use'

export function useCitizenColumns(
  onSort: (field: string) => void,
  onView: (citizen: Citizen) => void,
  onEdit: (citizen: Citizen) => void,
  onDelete: (citizen: Citizen) => void,
  onCustomAction: (actionKey: string, citizen: Citizen) => void
) {
  // ดึง custom actions จาก useCitizens
  const { customActions } = useCitizens()

  // สร้าง column builder
  const { createColumns } = useColumnBuilder<Citizen>()

  // แปลง custom actions เป็น format ที่ DataTableDropdown ต้องการ
  const filteredCustomActions = customActions.map((action) => {
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
      variant: variant,
      className: action.className,
      disabled: action.disabled,
      visible: action.visible,
      separator: action.separator,
    }
  })

  // กำหนด column configurations - Expand column อยู่แรกสุด
  const columnConfigs: ColumnConfig[] = [
    // Expand column - ต้องอยู่คอลัมน์แรกสุด
    {
      type: 'expand',
    },
    // ID column
    {
      type: 'id',
      key: 'id' as string,
      header: 'ID',
      sortable: true,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.ID,
    },
    // Citizen ID column
    {
      type: 'text',
      key: CITIZEN_DISPLAY_FIELDS.ID_FIELD as string,
      header: 'เลขบัตรประชาชน',
      sortable: true,
      enableHiding: false,
      className: CITIZEN_COLUMN_CLASSES.CITIZEN_ID,
    },
    // Birth date column
    {
      type: 'date',
      key: CITIZEN_DISPLAY_FIELDS.DATE_FIELD as string,
      header: 'วันเกิด',
      sortable: true,
      includeTime: false,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.DATE,
    },
    // Remark column
    {
      type: 'text',
      key: CITIZEN_DISPLAY_FIELDS.REMARK_FIELD as string,
      header: 'หมายเหตุ',
      sortable: true,
      maxLength: 50,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.REMARK,
    },
    // Created at column
    {
      type: 'date',
      key: 'created_at' as string,
      header: 'สร้างเมื่อ',
      sortable: true,
      includeTime: true,
      enableHiding: true,
      className: CITIZEN_COLUMN_CLASSES.CREATED_AT,
    },
    // Actions column - อยู่ท้ายสุด
    {
      type: 'action',
      idKey: 'id' as string,
      nameKey: CITIZEN_DISPLAY_FIELDS.ID_FIELD as string,
      enableCopy: true,
      enableView: true,
      enableEdit: true,
      enableDelete: true,
      enableHiding: false,
      customActions: filteredCustomActions,
    },
  ]

  // Callbacks สำหรับ columns
  const callbacks: ColumnCallbacks<Citizen> = {
    onSort,
    onView,
    onEdit,
    onDelete,
    onCustomAction,
  }

  console.log('[Citizen columns] Created columns configuration', {
    totalColumns: columnConfigs.length,
    customActions: filteredCustomActions.length,
    searchableFields: Object.values(CITIZEN_DISPLAY_FIELDS),
  })

  return createColumns(columnConfigs, callbacks)
}
