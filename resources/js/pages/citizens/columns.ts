// resources/js/pages/citizens/columns.ts
import { computed, h, type ComputedRef } from 'vue'
import { useColumnBuilder } from '@/composables/useColumnBuilder'
import DataTableDropdown from '@/components/custom/data-table/DataTableDropdown.vue'
import type { Citizen } from './types'
import type { TableColumn } from '@/types/table'

/**
 * สร้าง columns สำหรับ Citizens Data Table
 */
export function useCitizenColumns(
  onSort: (field: string) => void,
  onView: (citizen: Citizen) => void,
  onEdit: (citizen: Citizen) => void,
  onDelete: (citizen: Citizen) => void,
  onCustomAction: (actionKey: string, citizen: Citizen) => void
): ComputedRef<TableColumn<Citizen>[]> {
  
  const { 
    createExpandColumn,
    createIdColumn,
    createTextColumn, 
    createDateColumn,
    createActionColumn 
  } = useColumnBuilder<Citizen>()

  return computed(() => [
    // Column ที่ 1: Expand Button - ไม่ให้ซ่อนได้
    createExpandColumn(),
    
    // Column ที่ 2: ID Column - ให้ซ่อนได้
    createIdColumn('id', 'ID', { 
      sortable: true, 
      onSort,
      enableHiding: true
    }),
    
    // Column ที่ 3: Citizen ID - ไม่ให้ซ่อนได้ เพราะเป็น column หลัก
    createTextColumn('citizen_id', 'เลขประจำตัวประชาชน', {
      sortable: true,
      className: 'font-mono break-all',
      onSort,
      enableHiding: false // column หลัก ไม่ให้ซ่อน
    }),
    
    // Column ที่ 4: Birth date - ให้ซ่อนได้
    createDateColumn('birth_date', 'วันเกิด', {
      sortable: true,
      includeTime: false,
      onSort,
      enableHiding: true
    }),
    
    // Column ที่ 5: Remark - ให้ซ่อนได้
    createTextColumn('remark', 'หมายเหตุ', {
      sortable: true,
      maxLength: 50,
      onSort,
      enableHiding: true
    }),
    
    // Column ที่ 6: Created at - ให้ซ่อนได้
    createDateColumn('created_at', 'สร้างเมื่อ', {
      sortable: true,
      includeTime: true,
      className: 'text-gray-600',
      onSort,
      enableHiding: true
    }),

    // Column สุดท้าย: Actions - ไม่ให้ซ่อนได้
    createActionColumn((citizen: Citizen) => 
      h(DataTableDropdown, {
        item: citizen,
        idKey: 'id',
        nameKey: 'citizen_id',
        enableCopy: true,
        enableView: true,
        enableEdit: true,
        enableDelete: true,
        actions: [
          {
            key: 'generateCard',
            label: 'สร้างบัตร',
            separator: true
          },
          {
            key: 'viewHistory',
            label: 'ดูประวัติ'
          },
          {
            key: 'print',
            label: 'พิมพ์',
            separator: true
          },
          {
            key: 'export',
            label: 'ส่งออก Excel'
          }
        ],
        // Event handlers
        onView: (item: any) => onView(item as Citizen),
        onEdit: (item: any) => onEdit(item as Citizen),
        onDelete: (item: any) => onDelete(item as Citizen),
        onAction: (actionKey: string, item: any) => onCustomAction(actionKey, item as Citizen)
      }), '', { enableHiding: false } // ไม่ให้ซ่อน actions column
    )
  ])
}
