import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Payment } from '@/types/payment'
import { safeGetIsGrouped, safeGetIsAggregated, safeGetSubRows, statusMultiSelectFilter, amountRangeFilter } from '@/lib/table-utils'
import { formatCurrency, cn } from '@/lib/utils'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-vue-next'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import StatusBadge from './StatusBadge.vue'
import DropdownAction from './DropdownAction.vue'

export function createPaymentColumns(): ColumnDef<Payment>[] {
  return [
    // Select Column
    {
      id: 'select',
      header: ({ table }) => h(Checkbox, {
        'modelValue': table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'เลือกทั้งหมด',
      }),
      cell: ({ row }) => {
        if (safeGetIsGrouped(row)) return null
        
        return h(Checkbox, {
          'modelValue': row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
          'ariaLabel': 'เลือกแถว',
        })
      },
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      enableGrouping: false,
      size: 50,
      minSize: 50,
      maxSize: 50,
    },
    
    // ID Column
    {
      accessorKey: 'id',
      header: ({ column, header, table }) => h(DataTableColumnHeader, {
        column: column,
        title: 'Payment ID',
        header: header,
        table: table
      }),
      cell: ({ row }) => {
        if (safeGetIsGrouped(row)) {
          try {
            const subRows = safeGetSubRows(row)
            const indent = `${row.depth * 1}rem`
            return h('div', { 
              class: 'flex items-center font-medium',
              style: { paddingLeft: indent }
            }, [
              h(Button, {
                variant: 'ghost',
                size: 'sm',
                class: 'h-6 w-6 p-0 mr-2',
                onClick: () => {
                  try {
                    row.toggleExpanded()
                  } catch (error) {
                    console.warn('Toggle expanded failed:', error)
                  }
                }
              }, {
                default: () => {
                  try {
                    return row.getIsExpanded() 
                      ? h(Minus, { class: 'h-3 w-3' })
                      : h(Plus, { class: 'h-3 w-3' })
                  } catch {
                    return h(Plus, { class: 'h-3 w-3' })
                  }
                }
              }),
              `${subRows.length} การชำระ`
            ])
          } catch {
            return h('span', { class: 'font-medium' }, 'ข้อมูลที่จัดกลุ่ม')
          }
        }
        
        if (safeGetIsAggregated(row)) {
          try {
            const subRows = safeGetSubRows(row)
            return h('span', { class: 'font-medium' }, `${subRows.length} รายการ`)
          } catch {
            return h('span', { class: 'font-medium' }, 'ข้อมูลสรุป')
          }
        }
        
        return h('div', { class: 'font-mono text-sm' }, `#${row.getValue('id')}`)
      },
      size: 120,
      minSize: 100,
      maxSize: 200,
      enableResizing: true,
      enableColumnFilter: true,
      enableGrouping: false,
      aggregationFn: 'count',
    },

    // Status Column
    {
      accessorKey: 'status',
      header: ({ column, header, table }) => h(DataTableColumnHeader, {
        column: column,
        title: 'สถานะ',
        header: header,
        table: table
      }),
      cell: ({ row }) => {
        if (safeGetIsGrouped(row)) {
          try {
            const status = row.getValue('status') as string
            const subRows = safeGetSubRows(row)
            return h('div', { class: 'flex items-center' }, [
              h(StatusBadge, { status }),
              h('span', { class: 'ml-2 text-sm text-muted-foreground' }, 
                `(${subRows.length})`
              )
            ])
          } catch {
            return h('span', { class: 'text-sm text-muted-foreground' }, 'กลุ่ม')
          }
        }
        
        if (safeGetIsAggregated(row)) {
          return h('span', { class: 'text-sm text-muted-foreground' }, 'หลายสถานะ')
        }
        
        try {
          return h(StatusBadge, { status: row.getValue('status') as string })
        } catch {
          return h('span', { class: 'text-sm text-muted-foreground' }, 'ไม่ทราบ')
        }
      },
      size: 120,
      minSize: 100,
      maxSize: 180,
      enableResizing: true,
      enableColumnFilter: true,
      filterFn: statusMultiSelectFilter,
      enableGrouping: true,
      aggregationFn: 'count',
    },

    // Amount Column
    {
      accessorKey: 'amount',
      header: ({ column, header, table }) => h(DataTableColumnHeader, {
        column: column,
        title: 'จำนวน',
        class: 'justify-end',
        header: header,
        table: table
      }),
      cell: ({ row }) => {
        try {
          const amount = Number.parseFloat(row.getValue('amount') as string)
          const formatted = formatCurrency(amount)

          return h('div', { 
            class: cn(
              'text-right',
              safeGetIsGrouped(row) || safeGetIsAggregated(row) ? 'font-bold' : 'font-medium'
            )
          }, formatted)
        } catch {
          return h('div', { class: 'text-right font-medium' }, '$0.00')
        }
      },
      size: 120,
      minSize: 100,
      maxSize: 200,
      enableResizing: true,
      enableColumnFilter: true,
      filterFn: amountRangeFilter,
      enableGrouping: false,
      aggregationFn: 'sum',
    },

    // Email Column
    {
      accessorKey: 'email',
      header: ({ column, header, table }) => h(DataTableColumnHeader, {
        column: column,
        title: 'อีเมล',
        header: header,
        table: table
      }),
      cell: ({ row }) => {
        if (safeGetIsGrouped(row)) {
          try {
            const subRows = safeGetSubRows(row)
            const email = row.getValue('email') as string
            return h('div', { class: 'flex items-center' }, [
              h('span', { class: 'font-medium' }, email),
              h('span', { class: 'ml-2 text-sm text-muted-foreground' }, 
                `(${subRows.length})`
              )
            ])
          } catch {
            return h('span', { class: 'text-sm text-muted-foreground' }, 'อีเมลที่จัดกลุ่ม')
          }
        }
        
        if (safeGetIsAggregated(row)) {
          try {
            const uniqueCount = row.getValue('email') as string
            return h('span', { class: 'text-sm text-muted-foreground' }, 
              `${uniqueCount} อีเมลไม่ซ้ำ`
            )
          } catch {
            return h('span', { class: 'text-sm text-muted-foreground' }, 'หลายอีเมลไม่ซ้ำ')
          }
        }
        
        try {
          return h('div', { class: 'lowercase truncate' }, row.getValue('email') as string)
        } catch {
          return h('div', { class: 'lowercase truncate' }, 'unknown@email.com')
        }
      },
      size: 250,
      minSize: 150,
      maxSize: 400,
      enableResizing: true,
      enableColumnFilter: true,
      enableGrouping: true,
      aggregationFn: 'count',
    },

    // Actions Column
    {
      id: 'actions',
      enableHiding: false,
      enableResizing: false,
      enableGrouping: false,
      header: () => h('div', { class: 'text-center' }, 'การกระทำ'),
      cell: ({ row }) => {
        if (safeGetIsGrouped(row) || safeGetIsAggregated(row)) return null
        
        try {
          const payment = row.original

          return h('div', { class: 'flex justify-center' }, 
            h(DropdownAction, { 
              payment,
              onExpand: () => {
                try {
                  row.toggleExpanded()
                } catch (error) {
                  console.warn('Expand failed:', error)
                }
              }
            })
          )
        } catch {
          return null
        }
      },
      size: 80,
      minSize: 80,
      maxSize: 80,
    }
  ]
}
