// resources/js/components/tables/permission/columns.ts

import { h } from 'vue'
import { ColumnDef } from '@tanstack/vue-table'
import { Checkbox } from '@/components/ui/checkbox'
import DataTableColumnHeader from '@/components/ui/data-table/DataTableColumnHeader.vue'
import DataTableDropDown from '@/components/ui/data-table/DataTableDropDown.vue'
import type { UserPermission } from '@/types/permission'
import { toast } from 'vue-sonner'

/**
 * ขยายคำนิยาม TableMeta เพื่อเพิ่ม updateData method
 */
declare module '@tanstack/table-core' {
  interface TableMeta<TData> {
    updateData: (id: string | number, key: string, value: boolean) => void
  }
}

/**
 * สร้างคอลัมน์ checkbox สำหรับเลือกแถว (select row)
 */
const createRowSelectionColumn = (): ColumnDef<UserPermission> => ({
  id: 'select',
  header: ({ table }) =>
    // Checkbox สำหรับเลือกทุกแถวในหน้านั้น
    h(Checkbox, {
      'aria-label': 'เลือกทั้งหมด',
      'modelValue': table.getIsAllPageRowsSelected(),
      'indeterminate': table.getIsSomePageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
        if (typeof value === 'boolean') {
          table.toggleAllPageRowsSelected(value)
        }
      },
      class: 'mx-auto',
    }),
  cell: ({ row }) =>
    // Checkbox สำหรับเลือกแถวเดียว
    h(Checkbox, {
      'aria-label': 'เลือกแถว',
      'modelValue': row.getIsSelected(),
      'indeterminate': row.getIsSomeSelected && row.getIsSomeSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => {
        if (typeof value === 'boolean') {
          row.toggleSelected(value)
        }
      },
      class: 'mx-auto',
    }),
  size: 32, // กำหนดความกว้างคอลัมน์สำหรับ checkbox
  enableSorting: false,
  enableHiding: false,
})

/**
 * สร้างคอลัมน์ข้อความ (สำหรับข้อมูลทั่วไป)
 */
const createTextColumn = (key: 'egat_id' | 'name', title: string): ColumnDef<UserPermission> => ({
  accessorKey: key,
  header: ({ column }) => h(DataTableColumnHeader, { column, title })
})

/**
 * สร้างคอลัมน์สำหรับการจัดการสิทธิ์ด้วย checkbox
 */
const createPermissionColumn = (permission: 'view' | 'create' | 'update' | 'delete'): ColumnDef<UserPermission> => ({
  accessorKey: permission,
  header: ({ column }) => h(DataTableColumnHeader, {
    column,
    title: permission.charAt(0).toUpperCase() + permission.slice(1)
  }),
  cell: ({ row, table }) => {
    // แปลงค่าให้เป็น boolean เสมอ
    const value = Boolean(row.getValue(permission))
    return h(Checkbox, {
      'modelValue': value,
      'onUpdate:modelValue': function(value: boolean | 'indeterminate') {
        if (typeof value === 'boolean') {
          try {
            row.original[permission] = value
            table.options.meta?.updateData(row.original.id, permission, value)
          } catch (error) {
            toast.error(`ไม่สามารถอัพเดทสิทธิ์ ${permission} ได้`, {
              description: `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ'}`
            })
          }
        }
      },
      'aria-label': `Can ${permission} permission`,
    })
  }
})

/**
 * สร้างคอลัมน์ action dropdown สำหรับแต่ละแถว
 */
const createActionColumn = (): ColumnDef<UserPermission> => ({
  id: 'actions',
  header: '', // ไม่แสดงหัวคอลัมน์
  cell: ({ row }) =>
    h(DataTableDropDown, {
      // ส่ง items (array) สำหรับเมนู dropdown
      items: [
        {
          label: 'Actions',
          type: 'label',
          action: () => {},
        },
        {
          label: 'Copy EGAT ID',
          action: () => {
            navigator.clipboard.writeText(row.original.egat_id)
            toast.success('คัดลอก EGAT ID เรียบร้อย')
          },
        },
        {
          label: 'Copy Name',
          action: () => {
            navigator.clipboard.writeText(row.original.name)
            toast.success('คัดลอกชื่อเรียบร้อย')
          },
        },
        {
          type: 'separator',
          label: '',
          action: () => {},
        },
        {
          label: 'View User',
          action: () => toast.info(`ดูข้อมูลผู้ใช้: ${row.original.name}`),
        },
        {
          label: 'View Permissions',
          action: () => toast.info(`ดูสิทธิ์ของผู้ใช้: ${row.original.name}`),
        },
      ],
      label: 'Actions',
    })
})

/**
 * กำหนดคอลัมน์ทั้งหมดสำหรับตารางแสดงสิทธิ์ผู้ใช้งาน
 */
export const columns: ColumnDef<UserPermission>[] = [
  //createRowSelectionColumn(), // เพิ่มคอลัมน์ checkbox สำหรับเลือกแถว
  createTextColumn('egat_id', 'ID'),
  createTextColumn('name', 'Name'),
  createPermissionColumn('view'),
  createPermissionColumn('create'),
  createPermissionColumn('update'),
  createPermissionColumn('delete'),
  //createActionColumn(), // เพิ่มคอลัมน์ dropdown action
]
