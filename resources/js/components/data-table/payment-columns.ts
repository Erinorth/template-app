import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Payment } from '@/types/payment'
import { safeGetIsGrouped, safeGetIsAggregated, safeGetSubRows, statusMultiSelectFilter, amountRangeFilter } from '@/lib/table-utils'
import { formatCurrency, cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronDown, Plus, Minus } from 'lucide-vue-next'
import DataTableColumnHeader from './DataTableColumnHeader.vue'
import StatusBadge from './StatusBadge.vue'
import DropdownAction from './DropdownAction.vue'

export function createPaymentColumns(): ColumnDef<Payment>[] {
  return [
    // คอลัมน์ Payment ID - ลดขนาดลงเพราะ ID สั้น + ปุ่มสามเหลี่ยม
    {
      accessorKey: 'id',
      header: ({ column, header, table }) => h(DataTableColumnHeader, {
        column: column,
        title: 'Payment ID',
        header: header,
        table: table
      }),
      cell: ({ row }) => {
        // ตรวจสอบว่าเป็น grouped row หรือไม่
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
        
        // ตรวจสอบว่าเป็น aggregated row หรือไม่
        if (safeGetIsAggregated(row)) {
          try {
            const subRows = safeGetSubRows(row)
            return h('span', { class: 'font-medium' }, `${subRows.length} รายการ`)
          } catch {
            return h('span', { class: 'font-medium' }, 'ข้อมูลสรุป')
          }
        }
        
        // แถวปกติ - แสดง Payment ID พร้อมปุ่มขยาย
        return h('div', { class: 'flex items-center gap-1' }, [
          // ปุ่มสามเหลี่ยมสำหรับขยาย/ย่อแถว
          h(Button, {
            variant: 'ghost',
            size: 'sm',
            class: 'h-5 w-5 p-0 hover:bg-muted',
            onClick: (event: Event) => {
              event.stopPropagation()
              try {
                row.toggleExpanded()
              } catch (error) {
                console.warn('Toggle expanded failed:', error)
              }
            },
            title: row.getIsExpanded() ? 'ย่อรายละเอียด' : 'ขยายเพื่อดูรายละเอียด'
          }, {
            default: () => {
              try {
                return row.getIsExpanded() 
                  ? h(ChevronDown, { class: 'h-3 w-3 text-muted-foreground' })
                  : h(ChevronRight, { class: 'h-3 w-3 text-muted-foreground' })
              } catch {
                return h(ChevronRight, { class: 'h-3 w-3 text-muted-foreground' })
              }
            }
          }),
          // แสดง Payment ID
          h('span', { class: 'font-mono text-xs' }, `#${row.getValue('id')}`)
        ])
      },
      size: 130, // ลดจาก 150 เป็น 130
      minSize: 110, // ลดจาก 120 เป็น 110
      maxSize: 180, // ลดจาก 220 เป็น 180
      enableResizing: true,
      enableColumnFilter: true,
      enableGrouping: false,
      aggregationFn: 'count',
    },

    // คอลัมน์สถานะ - ลดขนาดลงเพราะ badge เล็ก
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
              h('span', { class: 'ml-2 text-xs text-muted-foreground' }, 
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
      size: 100, // ลดจาก 120 เป็น 100
      minSize: 85, // ลดจาก 100 เป็น 85
      maxSize: 140, // ลดจาก 180 เป็น 140
      enableResizing: true,
      enableColumnFilter: true,
      filterFn: statusMultiSelectFilter,
      enableGrouping: true,
      aggregationFn: 'count',
    },

    // คอลัมน์จำนวนเงิน - เพิ่มขนาดเล็กน้อย
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
              'text-right text-sm font-medium',
              safeGetIsGrouped(row) || safeGetIsAggregated(row) ? 'font-bold' : ''
            )
          }, formatted)
        } catch {
          return h('div', { class: 'text-right font-medium text-sm' }, '$0.00')
        }
      },
      size: 130, // เพิ่มจาก 120 เป็น 130
      minSize: 110, // เพิ่มจาก 100 เป็น 110
      maxSize: 180, // ลดจาก 200 เป็น 180
      enableResizing: true,
      enableColumnFilter: true,
      filterFn: amountRangeFilter,
      enableGrouping: false,
      aggregationFn: 'sum',
    },

    // คอลัมน์อีเมล - เพิ่มขนาดให้แสดงข้อมูลได้เต็ม
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
              h('span', { class: 'font-medium truncate' }, email),
              h('span', { class: 'ml-2 text-xs text-muted-foreground flex-shrink-0' }, 
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
          return h('div', { 
            class: 'lowercase truncate text-sm',
            title: row.getValue('email') as string // แสดง tooltip เมื่อ hover
          }, row.getValue('email') as string)
        } catch {
          return h('div', { class: 'lowercase truncate text-sm' }, 'unknown@email.com')
        }
      },
      size: 300, // เพิ่มจาก 250 เป็น 300
      minSize: 180, // เพิ่มจาก 150 เป็น 180
      maxSize: 450, // เพิ่มจาก 400 เป็น 450
      enableResizing: true,
      enableColumnFilter: true,
      enableGrouping: true,
      aggregationFn: 'count',
    },

    // คอลัมน์การดำเนินการ - คงเดิม
    {
      id: 'actions',
      enableHiding: false,
      enableResizing: false,
      enableGrouping: false,
      cell: ({ row }) => {
        if (safeGetIsGrouped(row) || safeGetIsAggregated(row)) return null
        
        try {
          const payment = row.original

          return h('div', { class: 'flex justify-center' }, 
            h(DropdownAction, { payment })
          )
        } catch {
          return null
        }
      },
      size: 60, // ลดจาก 80 เป็น 60
      minSize: 60,
      maxSize: 60,
    }
  ]
}
