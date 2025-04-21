import { h } from 'vue'
import { ColumnDef } from '@tanstack/vue-table'
import { Checkbox } from '@/components/ui/checkbox'
import DataTableColumnHeader from '@/components/ui/data-table/DataTableColumnHeader.vue'
import DropdownAction from '@/components/ui/data-table/DataTableDropDown.vue'
import type { Payment } from '@/features/payments/payment';

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => h(Checkbox, {
      'modelValue': table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | "indeterminate") => table.toggleAllPageRowsSelected(!!value),
      'aria-label': 'Select all',
    }),
    cell: ({ row }) => h(Checkbox, {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | "indeterminate") => row.toggleSelected(!!value),
      'aria-label': 'Select row',
    }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => h(DataTableColumnHeader, {
      column: column,
      title: 'ID'
    }),
  },
  {
    accessorKey: "amount",
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
      return h('div', { class: 'text-right font-medium' }, formatted);
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => h(DataTableColumnHeader, {
      column,
      title: 'Status'
    }),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return h('div', {
        class: `inline-flex rounded-md px-2 py-1 text-xs font-medium ${
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          status === 'processing' ? 'bg-blue-100 text-blue-800' :
          status === 'success' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`
      }, status.toString());
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => h(DataTableColumnHeader, {
      column: column,
      title: 'Email'
    }),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original;
      return h('div', { class: 'relative' }, [
        h(DropdownAction, {
          payment: { ...payment, id: payment.id.toString() },
          onExpand: () => row.toggleExpanded(),
        }),
      ]);
    },
  },
]