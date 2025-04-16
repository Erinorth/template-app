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
  },
  {
    accessorKey: "can_create",
    header: ({ column }) => (
      h(DataTableColumnHeader, {
        column: column,
        title: 'Create'
      })
    ),
  },
  {
    accessorKey: "can_edit",
    header: ({ column }) => (
      h(DataTableColumnHeader, {
        column: column,
        title: 'Edit'
      })
    ),
  },
  {
    accessorKey: "can_delete",
    header: ({ column }) => (
      h(DataTableColumnHeader, {
        column: column,
        title: 'Delete'
      })
    ),
  },
]