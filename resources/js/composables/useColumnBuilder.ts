// resources/js/composables/useColumnBuilder.ts

import { h } from 'vue'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/vue-table'
import { ArrowUpDown, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { formatDate, formatDateTime, formatCurrency, formatNumber, truncateText } from '@/lib/utils'

// เพิ่ม interface สำหรับ column options
interface BaseColumnOptions {
  sortable?: boolean
  className?: string
  onSort?: (col: string) => void
  enableHiding?: boolean // เพิ่ม option นี้
}

interface TextColumnOptions extends BaseColumnOptions {
  maxLength?: number
}

interface DateColumnOptions extends BaseColumnOptions {
  includeTime?: boolean
}

interface NumberColumnOptions extends BaseColumnOptions {
  currency?: boolean
  precision?: number
}

interface IdColumnOptions extends BaseColumnOptions {}

interface StatusColumnOptions extends BaseColumnOptions {
  statusMapping: Record<string, { label: string; className: string }>
}

export function useColumnBuilder<T>() {
  
  const createSortableHeader = (
    columnId: string, 
    displayName: string,
    onSort?: (col: string) => void
  ) => {
    return () =>
      h(
        Button,
        {
          variant: 'ghost',
          onClick: () => onSort?.(columnId),
          class: [
            'justify-start text-left p-2 h-auto font-medium hover:bg-gray-100',
            'w-full min-w-0 text-xs sm:text-sm'
          ],
        },
        () => [
          displayName,
          h(ArrowUpDown, { 
            class: 'ml-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0'
          }),
        ]
      )
  }

  const createExpandColumn = (header?: string): ColumnDef<T, any> => {
    return {
      id: 'expand',
      header: header || '', // ไม่มี header text หรือใช้ไอคอนเล็กๆ
      size: 50, // กำหนดขนาดแคบ
      enableSorting: false,
      enableHiding: false, // ไม่ให้ซ่อน expand column ได้
      enableResizing: false,
      cell: ({ row }) => {
        return h('div', { class: 'flex justify-center' }, [
          h(Button, {
            variant: 'ghost',
            size: 'sm',
            onClick: () => row.toggleExpanded(),
            class: 'p-1 h-7 w-7 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors',
            'aria-label': row.getIsExpanded() ? 'ย่อแถว' : 'ขยายแถว',
            title: row.getIsExpanded() ? 'ย่อแถว' : 'ขยายแถว'
          }, () => [
            h(row.getIsExpanded() ? ChevronDown : ChevronRight, { 
              class: 'h-4 w-4 text-gray-500' 
            })
          ])
        ])
      },
    }
  }

  const createTextColumn = (
    accessorKey: keyof T,
    header: string,
    options?: TextColumnOptions
  ): ColumnDef<T, any> => {
    return {
      accessorKey: accessorKey as string,
      header: options?.sortable ? 
        createSortableHeader(accessorKey as string, header, options.onSort) : 
        header,
      enableHiding: options?.enableHiding ?? true, // default ให้ซ่อนได้
      cell: ({ getValue }) => {
        const value = getValue() as string | null | undefined
        const displayValue = value || '-'
        const finalValue = options?.maxLength ? 
          truncateText(displayValue, options.maxLength) : 
          displayValue
        
        return h(
          'div',
          { 
            class: `text-xs sm:text-sm px-2 py-1 ${options?.className || ''}`,
            title: options?.maxLength && value ? value : undefined
          },
          finalValue
        )
      },
    }
  }

  const createDateColumn = (
    accessorKey: keyof T,
    header: string,
    options?: DateColumnOptions
  ): ColumnDef<T, any> => {
    return {
      accessorKey: accessorKey as string,
      header: options?.sortable ? 
        createSortableHeader(accessorKey as string, header, options.onSort) : 
        header,
      enableHiding: options?.enableHiding ?? true, // default ให้ซ่อนได้
      cell: ({ getValue }) => {
        const value = getValue() as string | null | undefined
        const displayValue = value ? 
          (options?.includeTime ? formatDateTime(value) : formatDate(value)) : 
          '-'
        
        return h(
          'div',
          { 
            class: `text-xs sm:text-sm px-2 py-1 ${options?.className || ''}` 
          },
          displayValue
        )
      },
    }
  }

  const createNumberColumn = (
    accessorKey: keyof T,
    header: string,
    options?: NumberColumnOptions
  ): ColumnDef<T, any> => {
    return {
      accessorKey: accessorKey as string,
      header: options?.sortable ? 
        createSortableHeader(accessorKey as string, header, options.onSort) : 
        header,
      enableHiding: options?.enableHiding ?? true, // default ให้ซ่อนได้
      cell: ({ getValue }) => {
        const value = getValue() as number | null | undefined
        
        let displayValue = '-'
        if (typeof value === 'number') {
          if (options?.currency) {
            displayValue = formatCurrency(value)
          } else {
            displayValue = formatNumber(value, 'th-TH', {
              minimumFractionDigits: options?.precision ?? 0,
              maximumFractionDigits: options?.precision ?? 2
            })
          }
        }
        
        return h(
          'div',
          { 
            class: `text-xs sm:text-sm px-2 py-1 text-right ${options?.className || ''}` 
          },
          displayValue
        )
      },
    }
  }

  const createIdColumn = (
    accessorKey: keyof T = 'id' as keyof T,
    header: string = 'ID',
    options?: IdColumnOptions
  ): ColumnDef<T, any> => {
    return {
      accessorKey: accessorKey as string,
      header: options?.sortable ? 
        createSortableHeader(accessorKey as string, header, options.onSort) : 
        header,
      enableHiding: options?.enableHiding ?? true, // default ให้ซ่อนได้
      cell: ({ row }) => h(
        'div', 
        { 
          class: 'text-xs sm:text-sm font-mono text-gray-600 px-2 py-1' 
        }, 
        row.getValue(accessorKey as string)
      ),
    }
  }

  const createStatusColumn = (
    accessorKey: keyof T,
    header: string,
    options: StatusColumnOptions
  ): ColumnDef<T, any> => {
    return {
      accessorKey: accessorKey as string,
      header: options.sortable ? 
        createSortableHeader(accessorKey as string, header, options.onSort) : 
        header,
      enableHiding: options?.enableHiding ?? true, // default ให้ซ่อนได้
      cell: ({ getValue }) => {
        const value = getValue() as string | null | undefined
        const statusConfig = value ? options.statusMapping[value] : null
        
        if (!statusConfig) {
          return h('div', { class: 'px-2 py-1' }, '-')
        }
        
        return h(
          'div',
          { class: 'px-2 py-1' },
          h(
            'span',
            {
              class: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`
            },
            statusConfig.label
          )
        )
      },
    }
  }

  const createActionColumn = <R>(
    cellRenderer: (row: R) => any,
    header = '',
    options?: { enableHiding?: boolean }
  ): ColumnDef<R, unknown> => ({
    id: 'actions',
    header,
    enableSorting: false,
    enableHiding: options?.enableHiding ?? false, // default ไม่ให้ซ่อน actions ได้
    cell: ({ row }) => cellRenderer(row.original as R)
  })

  return {
    createSortableHeader,
    createExpandColumn, 
    createTextColumn,
    createDateColumn,
    createNumberColumn,
    createIdColumn,
    createStatusColumn,
    createActionColumn
  }
}
