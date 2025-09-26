import { h } from 'vue'
// comment: import Button component สำหรับใช้กับ header
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Citizen } from '@/types/citizen'
import { ArrowUpDown } from 'lucide-vue-next'

// comment: สร้าง columns สำหรับ Data Table (Citizen)
export function useCitizenColumns({ onSort, currentSort, currentDirection }: {
  onSort: (col: string) => void
  currentSort: string
  currentDirection: string
}) {
  const columns: ColumnDef<Citizen, any>[] = [
    {
      accessorKey: 'id',
      header: () =>
        h(
          Button,
          {
            variant: 'ghost',
            onClick: () => onSort('id'),
            class: currentSort === 'id'
              ? currentDirection === 'asc'
                ? 'text-blue-500'
                : 'text-blue-800'
              : '',
          },
          () => [
            'ID',
            h(ArrowUpDown, { class: 'ml-2 h-4 w-4' }),
          ]
        ),
      cell: ({ row }) => h('div', { class: 'lowercase' }, row.getValue('id')),
    },
    {
      accessorKey: 'citizen_id',
      header: 'เลขประจำตัวประชาชน',
      cell: ({ getValue }) => getValue() ?? '-',
    },
    {
      accessorKey: 'birth_date',
      header: 'วันเกิด',
      cell: ({ getValue }) => {
        const v = getValue() as string | null | undefined
        return v ? new Date(v).toLocaleDateString() : '-'
      },
    },
    {
      accessorKey: 'remark',
      header: 'หมายเหตุ',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'created_at',
      header: 'สร้างเมื่อ',
      cell: ({ getValue }) => {
        const v = getValue() as string | null | undefined
        return v ? new Date(v).toLocaleString() : '-'
      },
    },
  ]
  return { columns }
}
