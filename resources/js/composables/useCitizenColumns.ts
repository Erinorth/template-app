// ไฟล์: composables/useCitizenColumns.ts
// สถานที่เก็บ: D:\xampp\htdocs\project-name\resources\js\composables\useCitizenColumns.ts

import { h } from 'vue'
// comment: import Button component สำหรับใช้กับ header
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Citizen } from '@/types/citizen'
import { ArrowUpDown } from 'lucide-vue-next'

// comment: สร้าง columns สำหรับ Data Table (Citizen) พร้อมความสามารถในการเรียงลำดับทุก column
export function useCitizenColumns({ onSort, currentSort, currentDirection }: {
  onSort: (col: string) => void
  currentSort: string
  currentDirection: string
}) {
  // comment: function สำหรับสร้าง sortable header แบบ generic โดยไม่มีสีพิเศษ
  const createSortableHeader = (columnId: string, displayName: string) => {
    return () =>
      h(
        Button,
        {
          variant: 'ghost',
          onClick: () => onSort(columnId),
          class: [
            // comment: ใช้ style พื้นฐานโดยไม่มีสีพิเศษ
            'justify-start text-left p-2 h-auto font-medium hover:bg-gray-100',
            // comment: responsive design - จัดขนาดปุ่มให้เหมาะสมกับหน้าจอขนาดต่างๆ
            'w-full min-w-0 text-xs sm:text-sm'
          ],
        },
        () => [
          // comment: ชื่อคอลัมน์และลูกศรอยู่ติดกัน ไม่มี margin ระหว่าง
          displayName,
          h(ArrowUpDown, { 
            class: 'ml-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0'
          }),
        ]
      )
  }

  const columns: ColumnDef<Citizen, any>[] = [
    {
      accessorKey: 'id',
      header: createSortableHeader('id', 'ID'),
      cell: ({ row }) => h(
        'div', 
        { 
          class: 'text-xs sm:text-sm font-mono text-gray-600 px-2 py-1' 
        }, 
        row.getValue('id')
      ),
    },
    {
      accessorKey: 'citizen_id',
      header: createSortableHeader('citizen_id', 'เลขประจำตัวประชาชน'),
      cell: ({ getValue }) => {
        const value = getValue()
        return h(
          'div',
          { 
            class: 'font-mono text-xs sm:text-sm px-2 py-1 break-all' 
          },
          value ?? '-'
        )
      },
    },
    {
      accessorKey: 'birth_date',
      header: createSortableHeader('birth_date', 'วันเกิด'),
      cell: ({ getValue }) => {
        const value = getValue() as string | null | undefined
        return h(
          'div',
          { 
            class: 'text-xs sm:text-sm px-2 py-1' 
          },
          value ? new Date(value).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : '-'
        )
      },
    },
    {
      accessorKey: 'remark',
      header: createSortableHeader('remark', 'หมายเหตุ'),
      cell: ({ getValue }) => {
        const value = getValue() as string | null | undefined
        return h(
          'div',
          { 
            class: 'text-xs sm:text-sm px-2 py-1 max-w-xs truncate' 
          },
          value || '-'
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: createSortableHeader('created_at', 'สร้างเมื่อ'),
      cell: ({ getValue }) => {
        const value = getValue() as string | null | undefined
        return h(
          'div',
          { 
            class: 'text-xs sm:text-sm text-gray-600 px-2 py-1' 
          },
          value ? new Date(value).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'
        )
      },
    },
  ]

  return { columns }
}
