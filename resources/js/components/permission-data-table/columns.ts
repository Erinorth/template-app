import { h } from 'vue'
import DropdownAction from '@/components/permission-data-table/DataTableDropDown.vue'
import { ColumnDef } from '@tanstack/vue-table'
import { Checkbox } from '@/components/ui/checkbox'
import DataTableColumnHeader from '@/components/permission-data-table/DataTableColumnHeader.vue'

// กำหนด interface สำหรับข้อมูลผู้ใช้และสิทธิ์
interface UserPermission {
  id: number | string;
  egat_id: string;
  name: string;
  can_read: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  [key: string]: any; // สำหรับคุณสมบัติอื่นๆ ที่อาจมีเพิ่มเติม
}

export const columns: ColumnDef<UserPermission>[] = [
  {
    accessorKey: "egat_id",
    header: ({ column }) => (
      h(DataTableColumnHeader, {
        column: column,
        title: 'ID'
      })
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      h(DataTableColumnHeader, {
        column: column,
        title: 'Name'
      })
    ),
  },
  {
    accessorKey: "can_read",
    header: ({ column }) => (
      h(DataTableColumnHeader, {
        column: column,
        title: 'Read'
      })
    ),
    cell: ({ row }) => h(Checkbox, {
      'modelValue': row.getValue("can_read"),
      'onUpdate:modelValue': (value) => {
        // โค้ดสำหรับการอัปเดตค่า
      },
      'aria-label': 'Can read permission',
    }),    
  },
  {
    accessorKey: "can_create",
    header: ({ column }) => (
      h(DataTableColumnHeader, {
        column: column,
        title: 'Create'
      })
    ),
    cell: ({ row }) => h(Checkbox, {
      'modelValue': row.getValue("can_create"),
      'onUpdate:modelValue': (value) => {
        // โค้ดสำหรับการอัปเดตค่า
      },
      'aria-label': 'Can create permission',
    }),    
  },
  {
    accessorKey: "can_edit",
    header: ({ column }) => (
      h(DataTableColumnHeader, {
        column: column,
        title: 'Edit'
      })
    ),
    cell: ({ row }) => h(Checkbox, {
      'modelValue': row.getValue("can_read"),
      'onUpdate:modelValue': (value) => {
        // โค้ดสำหรับการอัปเดตค่า
      },
      'aria-label': 'Can edit permission',
    }),    
  },
  {
    accessorKey: "can_delete",
    header: ({ column }) => (
      h(DataTableColumnHeader, {
        column: column,
        title: 'Delete'
      })
    ),
    cell: ({ row }) => h(Checkbox, {
      'modelValue': row.getValue("can_delete"),
      'onUpdate:modelValue': (value) => {
        // โค้ดสำหรับการอัปเดตค่า
      },
      'aria-label': 'Can delete permission',
    }),    
  },
]