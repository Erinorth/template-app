import type { ComputedRef } from 'vue'
import { useColumnBuilder, type ColumnConfig, type ColumnCallbacks } from '@/composables/useColumnBuilder'
import type { Citizen } from './types'
import type { TableColumn } from '@/types/table'

/**
 * Composable สำหรับสร้าง citizen table columns
 * ใช้ useColumnBuilder แบบ configuration-based
 */
export function useCitizenColumns(
  onSort: (field: string) => void,
  onView: (citizen: Citizen) => void,
  onEdit: (citizen: Citizen) => void,
  onDelete: (citizen: Citizen) => void,
  onCustomAction: (actionKey: string, citizen: Citizen) => void
): ComputedRef<TableColumn<Citizen>[]> {
  
  // ใช้ useColumnBuilder (all-in-one)
  const { createColumns } = useColumnBuilder<Citizen>()

  // กำหนด column configurations
  const columnConfigs: ColumnConfig[] = [
    // Expand column
    { type: 'expand' },
    
    // ID column 
    {
      type: 'id',
      key: 'id',
      header: 'ID',
      sortable: true,
      enableHiding: true
    },
    
    // เลขประจำตัวประชาชน
    {
      type: 'text',
      key: 'citizen_id',
      header: 'เลขประจำตัวประชาชน',
      sortable: true,
      enableHiding: false,
      className: 'font-mono break-all'
    },
    
    // วันเกิด
    {
      type: 'date',
      key: 'birth_date',
      header: 'วันเกิด',
      sortable: true,
      includeTime: false,
      enableHiding: true
    },
    
    // หมายเหตุ
    {
      type: 'text',
      key: 'remark',
      header: 'หมายเหตุ',
      sortable: true,
      maxLength: 50,
      enableHiding: true
    },
    
    // วันที่สร้าง
    {
      type: 'date',
      key: 'created_at',
      header: 'สร้างเมื่อ',
      sortable: true,
      includeTime: true,
      enableHiding: true,
      className: 'text-gray-600'
    },

    // Action column
    {
      type: 'action',
      idKey: 'id',
      nameKey: 'citizen_id',
      enableCopy: true,
      enableView: true,
      enableEdit: true,
      enableDelete: true,
      enableHiding: false,
      customActions: [
        { key: 'generateCard', label: 'สร้างบัตร', separator: true },
        { key: 'viewHistory', label: 'ดูประวัติ' },
        { key: 'print', label: 'พิมพ์', separator: true },
        { key: 'export', label: 'ส่งออก Excel' }
      ]
    }
  ]

  // กำหนด callbacks
  const callbacks: ColumnCallbacks<Citizen> = {
    onSort,
    onView,
    onEdit,
    onDelete,
    onCustomAction
  }

  return createColumns(columnConfigs, callbacks)
}
