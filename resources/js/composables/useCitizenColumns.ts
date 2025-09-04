import type { ColumnDef } from '@tanstack/vue-table'
import type { Citizen } from '@/types/citizen'

export function useCitizenColumns() {
  const columns: ColumnDef<Citizen, any>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'citizen_id', header: 'เลขประจำตัวประชาชน', cell: ({ getValue }) => getValue() ?? '-' },
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
