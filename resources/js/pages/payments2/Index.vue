<!-- resources\js\pages\payments2\Index.vue -->
<script setup lang="ts">
import { h, onMounted, ref, computed, watch } from 'vue'
import type { 
  ColumnDef, 
  SortingState, 
  ColumnFiltersState,
  VisibilityState,
  ExpandedState,
  GroupingState,
  Updater,
  Column,
  ColumnSizingState,
  FilterFn
} from '@tanstack/vue-table'
import type { Ref } from 'vue'
import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getGroupedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { 
  MoreHorizontal, 
  ArrowDown, 
  ArrowUp, 
  ArrowUpDown, 
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings2,
  GripVertical,
  Filter,
  X,
  Search,
  Plus,
  Minus,
  Group,
  Ungroup
} from 'lucide-vue-next'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'vue-sonner'

// Layout และ Navigation imports
import AppLayout from '@/layouts/AppLayout.vue'
import { Head } from '@inertiajs/vue3'
import type { BreadcrumbItem } from '@/types'

// Import StatusFilter component แทนการเขียน inline
import StatusFilter from '@/components/data-table/StatusFilter.vue'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import {
  safeGetIsGrouped,
  safeGetIsAggregated,
  safeGetSubRows,
} from '@/lib/table-utils'

// การกำหนด Props สำหรับรับข้อมูลจาก Laravel Controller
const props = defineProps<{
  payments: Payment[]
}>()

// การกำหนด Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'Payments',
    href: '/payments',
  },
]

// ฟังก์ชัน Utility
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function'
    ? updaterOrValue(ref.value)
    : updaterOrValue
}

// การกำหนด Type definitions
interface Payment {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

// Interface สำหรับ Filter Options
interface EmailSuggestion {
  value: string
  count: number
}

interface AmountFilter {
  min?: number
  max?: number
}

// Custom filter functions ที่ปรับปรุงแล้ว
const statusMultiSelectFilter: FilterFn<Payment> = (row, columnId, filterValue: string[]) => {
  console.log('Status filter called:', { 
    cellValue: row.getValue(columnId), 
    filterValue 
  })
  
  // ถ้าไม่มี filter value หรือเป็น array ว่าง ให้แสดงทุกแถว
  if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
    return true
  }
  
  const cellValue = row.getValue(columnId) as string
  const result = filterValue.includes(cellValue)
  
  console.log('Filter result:', result)
  return result
}

const amountRangeFilter: FilterFn<Payment> = (row, columnId, filterValue: AmountFilter) => {
  if (!filterValue) return true
  const cellValue = Number.parseFloat(row.getValue(columnId) as string)
  if (filterValue.min !== undefined && cellValue < filterValue.min) return false
  if (filterValue.max !== undefined && cellValue > filterValue.max) return false
  return true
}

// Enhanced Amount Range Filter Component พร้อม Faceted Min/Max
const AmountRangeFilter = (props: { column: Column<Payment, any> }) => {
  const filterValue = ref<AmountFilter>(props.column.getFilterValue() as AmountFilter || {})
  
  const facetedMinMax = computed(() => {
    try {
      const minMax = props.column.getFacetedMinMaxValues()
      return minMax ? [minMax[0], minMax[1]] : [0, 1000]
    } catch {
      return [0, 1000]
    }
  })
  
  const updateFilter = () => {
    const hasValues = filterValue.value.min !== undefined || filterValue.value.max !== undefined
    props.column.setFilterValue(hasValues ? { ...filterValue.value } : undefined)
    
    if (hasValues) {
      toast.success(`กรองจำนวน: $${filterValue.value.min || 0} - $${filterValue.value.max || 'ไม่จำกัด'}`)
    }
  }

  const clearFilter = () => {
    filterValue.value = {}
    props.column.setFilterValue(undefined)
    toast.info('ล้างการกรองจำนวนเงิน')
  }

  const hasFilter = computed(() => {
    return filterValue.value.min !== undefined || filterValue.value.max !== undefined
  })

  return h(Popover, {}, {
    default: () => [
      h(PopoverTrigger, { asChild: true }, {
        default: () => h(Button, {
          variant: hasFilter.value ? 'default' : 'outline',
          size: 'sm',
          class: 'h-8'
        }, {
          default: () => [
            h(Filter, { class: 'w-4 h-4 mr-2' }),
            'จำนวน',
            hasFilter.value ? h(Badge, {
              variant: 'secondary',
              class: 'ml-2 rounded-sm px-1 font-normal'
            }, { default: () => '•' }) : null
          ]
        })
      }),
      h(PopoverContent, { class: 'w-[320px] p-0', align: 'start' }, {
        default: () => h('div', { class: 'p-4 space-y-4' }, [
          h('div', { class: 'flex items-center justify-between' }, [
            h('h4', { class: 'font-medium text-sm' }, 'กรองตามจำนวนเงิน'),
            hasFilter.value ? h(Button, {
              variant: 'ghost',
              size: 'sm',
              onClick: clearFilter,
              class: 'h-auto p-1'
            }, { default: () => h(X, { class: 'w-3 h-3' }) }) : null
          ]),
          h('div', { class: 'text-xs text-muted-foreground mb-2' }, [
            `ช่วง: $${facetedMinMax.value[0]} - $${facetedMinMax.value[1]}`
          ]),
          h('div', { class: 'grid grid-cols-2 gap-2' }, [
            h('div', { class: 'space-y-2' }, [
              h('label', { class: 'text-xs text-muted-foreground' }, 'จำนวนขั้นต่ำ'),
              h(Input, {
                type: 'number',
                placeholder: `${facetedMinMax.value[0]}`,
                min: facetedMinMax.value[0],
                max: facetedMinMax.value[1],
                value: filterValue.value.min?.toString() || '',
                'onUpdate:modelValue': (value: string | number) => {
                  filterValue.value.min = value ? Number(value) : undefined
                  updateFilter()
                }
              })
            ]),
            h('div', { class: 'space-y-2' }, [
              h('label', { class: 'text-xs text-muted-foreground' }, 'จำนวนสูงสุด'),
              h(Input, {
                type: 'number',
                placeholder: `${facetedMinMax.value[1]}`,
                min: facetedMinMax.value[0],
                max: facetedMinMax.value[1],
                value: filterValue.value.max?.toString() || '',
                'onUpdate:modelValue': (value: string | number) => {
                  filterValue.value.max = value ? Number(value) : undefined
                  updateFilter()
                }
              })
            ])
          ])
        ])
      })
    ]
  })
}

// Enhanced Email Filter พร้อม Autocomplete โดยใช้ Faceted Values
const EmailAutocompleteFilter = (props: { column: Column<Payment, any> }) => {
  const open = ref(false)
  const inputValue = ref(props.column.getFilterValue() as string || '')
  
  const emailSuggestions = computed((): EmailSuggestion[] => {
    try {
      const uniqueValues = props.column.getFacetedUniqueValues()
      return Array.from(uniqueValues.entries())
        .map(([value, count]: [string, number]) => ({ 
          value: value as string, 
          count: count as number 
        }))
        .filter((item: EmailSuggestion) => 
          inputValue.value === '' || 
          item.value.toLowerCase().includes(inputValue.value.toLowerCase())
        )
        .sort((a: EmailSuggestion, b: EmailSuggestion) => b.count - a.count)
        .slice(0, 10)
    } catch {
      return []
    }
  })

  const selectEmail = (email: string) => {
    inputValue.value = email
    props.column.setFilterValue(email)
    open.value = false
    toast.success(`กรองอีเมล: ${email}`)
  }

  const clearFilter = () => {
    inputValue.value = ''
    props.column.setFilterValue('')
    toast.info('ล้างการกรองอีเมล')
  }

  return h('div', { class: 'relative' }, [
    h(Popover, { 
      open: open.value,
      'onUpdate:open': (newOpen: boolean) => { open.value = newOpen }
    }, {
      default: () => [
        h(PopoverTrigger, { asChild: true }, {
          default: () => h('div', { class: 'relative' }, [
            h(Input, {
              class: 'max-w-sm pr-8',
              placeholder: 'กรองอีเมล...',
              value: inputValue.value,
              'onUpdate:modelValue': (value: string | number) => {
                const stringValue = String(value)
                inputValue.value = stringValue
                props.column.setFilterValue(stringValue)
                open.value = stringValue.length > 0
              },
              onFocus: () => { open.value = true }
            }),
            inputValue.value ? h(Button, {
              variant: 'ghost',
              size: 'sm',
              class: 'absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0',
              onClick: clearFilter
            }, { default: () => h(X, { class: 'h-3 w-3' }) }) : h(Search, { 
              class: 'absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' 
            })
          ])
        }),
        emailSuggestions.value.length > 0 ? h(PopoverContent, { 
          class: 'w-[var(--radix-popover-trigger-width)] p-0',
          align: 'start' 
        }, {
          default: () => h(Command, {}, {
            default: () => [
              h(CommandList, {}, {
                default: () => [
                  h(CommandEmpty, {}, { default: () => 'ไม่พบอีเมล' }),
                  h(CommandGroup, {}, {
                    default: () => emailSuggestions.value.map((suggestion: EmailSuggestion) =>
                      h(CommandItem, {
                        key: suggestion.value,
                        value: suggestion.value,
                        onSelect: () => selectEmail(suggestion.value),
                        class: 'flex items-center justify-between'
                      }, {
                        default: () => [
                          h('span', { class: 'truncate' }, suggestion.value),
                          h('span', { 
                            class: 'text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-2' 
                          }, suggestion.count.toString())
                        ]
                      })
                    )
                  })
                ]
              })
            ]
          })
        }) : null
      ]
    })
  ])
}

// Grouping Controls Component
const GroupingControls = (props: { table: any }) => {
  const currentGrouping = computed(() => {
    try {
      return props.table.getState().grouping || []
    } catch {
      return []
    }
  })

  const clearAllGrouping = () => {
    try {
      props.table.resetGrouping()
      toast.info('ยกเลิกการจัดกลุ่มทั้งหมด')
    } catch (error) {
      console.warn('Clear grouping failed:', error)
    }
  }

  const groupByStatus = () => {
    try {
      props.table.setGrouping(['status'])
      toast.success('จัดกลุ่มตามสถานะ')
    } catch (error) {
      console.warn('Group by status failed:', error)
    }
  }

  const groupByEmail = () => {
    try {
      props.table.setGrouping(['email'])
      toast.success('จัดกลุ่มตามอีเมล')
    } catch (error) {
      console.warn('Group by email failed:', error)
    }
  }

  return h('div', { class: 'flex items-center gap-2' }, [
    // Quick grouping buttons
    h(Button, {
      variant: currentGrouping.value.includes('status') ? 'default' : 'outline',
      size: 'sm',
      onClick: groupByStatus,
      class: 'h-8'
    }, {
      default: () => [
        h(Group, { class: 'w-4 h-4 mr-2' }),
        'จัดกลุ่มตามสถานะ'
      ]
    }),

    h(Button, {
      variant: currentGrouping.value.includes('email') ? 'default' : 'outline',
      size: 'sm',
      onClick: groupByEmail,
      class: 'h-8'
    }, {
      default: () => [
        h(Group, { class: 'w-4 h-4 mr-2' }),
        'จัดกลุ่มตามอีเมล'
      ]
    }),

    // Clear all button
    currentGrouping.value.length > 0 ? h(Button, {
      variant: 'ghost',
      size: 'sm',
      onClick: clearAllGrouping,
      class: 'h-8'
    }, {
      default: () => [
        h(Ungroup, { class: 'w-4 h-4 mr-2' }),
        'ยกเลิกทั้งหมด'
      ]
    }) : null
  ])
}

// Column Resize Handle Component
const ColumnResizeHandle = (props: { header: any, table: any }) => {
  const isResizing = ref(false)
  const startX = ref(0)
  const startWidth = ref(0)

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    isResizing.value = true
    startX.value = e.clientX
    startWidth.value = props.header.getSize()
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.value) return
      
      const deltaX = e.clientX - startX.value
      const newWidth = Math.max(50, startWidth.value + deltaX)
      
      props.table.setColumnSizing({
        ...props.table.getState().columnSizing,
        [props.header.column.id]: newWidth
      })
    }

    const handleMouseUp = () => {
      isResizing.value = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleDoubleClick = () => {
    const newSizing = { ...props.table.getState().columnSizing }
    delete newSizing[props.header.column.id]
    props.table.setColumnSizing(newSizing)
  }

  return h('div', {
    onMousedown: handleMouseDown,
    onDblclick: handleDoubleClick,
    class: cn(
      'absolute top-0 right-0 w-1 h-full cursor-col-resize select-none',
      'bg-border hover:bg-blue-500 active:bg-blue-600',
      'transition-colors duration-150',
      isResizing.value ? 'bg-blue-500' : ''
    ),
    style: {
      userSelect: 'none',
      touchAction: 'none'
    }
  }, [
    h('div', {
      class: 'w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity'
    }, [
      h(GripVertical, { class: 'w-3 h-3 text-muted-foreground' })
    ])
  ])
}

// DataTableColumnHeader component function พร้อม resize handle และ grouping
const DataTableColumnHeader = (props: { column: Column<Payment, any>, title: string, class?: string, header?: any, table?: any }) => {
  if (props.column.getCanSort()) {
    return h('div', { 
      class: cn('flex items-center space-x-2 relative pr-2', props.class ?? '') 
    }, [
      h(DropdownMenu, {}, {
        default: () => [
          h(DropdownMenuTrigger, { asChild: true }, {
            default: () => h(Button, {
              variant: 'ghost',
              size: 'sm',
              class: '-ml-3 h-8 data-[state=open]:bg-accent'
            }, {
              default: () => [
                h('span', {}, props.title),
                props.column.getIsSorted() === 'desc' 
                  ? h(ArrowDown, { class: 'w-4 h-4 ml-2' })
                  : props.column.getIsSorted() === 'asc'
                  ? h(ArrowUp, { class: 'w-4 h-4 ml-2' })
                  : h(ArrowUpDown, { class: 'w-4 h-4 ml-2' })
              ]
            })
          }),
          h(DropdownMenuContent, { align: 'start' }, {
            default: () => [
              h(DropdownMenuItem, {
                onClick: () => props.column.toggleSorting(false)
              }, {
                default: () => [
                  h(ArrowUp, { class: 'mr-2 h-3.5 w-3.5 text-muted-foreground/70' }),
                  'เรียงจากน้อยไปมาก'
                ]
              }),
              h(DropdownMenuItem, {
                onClick: () => props.column.toggleSorting(true)
              }, {
                default: () => [
                  h(ArrowDown, { class: 'mr-2 h-3.5 w-3.5 text-muted-foreground/70' }),
                  'เรียงจากมากไปน้อย'
                ]
              }),
              h(DropdownMenuSeparator),
              // เพิ่ม grouping options หากคอลัมน์สามารถจัดกลุ่มได้
              (() => {
                try {
                  return props.column.getCanGroup && props.column.getCanGroup() ? [
                    h(DropdownMenuItem, {
                      onClick: () => {
                        try {
                          props.column.toggleGrouping()
                        } catch (error) {
                          console.warn('Toggle grouping failed:', error)
                        }
                      }
                    }, {
                      default: () => [
                        (() => {
                          try {
                            return props.column.getIsGrouped() 
                              ? h(Ungroup, { class: 'mr-2 h-3.5 w-3.5 text-muted-foreground/70' })
                              : h(Group, { class: 'mr-2 h-3.5 w-3.5 text-muted-foreground/70' })
                          } catch {
                            return h(Group, { class: 'mr-2 h-3.5 w-3.5 text-muted-foreground/70' })
                          }
                        })(),
                        (() => {
                          try {
                            return props.column.getIsGrouped() ? 'ยกเลิกการจัดกลุ่ม' : 'จัดกลุ่ม'
                          } catch {
                            return 'จัดกลุ่ม'
                          }
                        })()
                      ]
                    }),
                    h(DropdownMenuSeparator)
                  ] : null
                } catch {
                  return null
                }
              })(),
              h(DropdownMenuItem, {
                onClick: () => props.column.toggleVisibility(false)
              }, {
                default: () => [
                  h(EyeOff, { class: 'mr-2 h-3.5 w-3.5 text-muted-foreground/70' }),
                  'ซ่อนคอลัมน์'
                ]
              })
            ]
          })
        ]
      }),
      props.header && props.table ? h(ColumnResizeHandle, {
        header: props.header,
        table: props.table
      }) : null
    ])
  } else {
    return h('div', { 
      class: cn('relative pr-2', props.class) 
    }, [
      props.title,
      props.header && props.table ? h(ColumnResizeHandle, {
        header: props.header,
        table: props.table
      }) : null
    ])
  }
}

// DataTableViewOptions component function
const DataTableViewOptions = (props: { table: any }) => {
  const columns = computed(() => props.table.getAllColumns()
    .filter((column: any) => 
      typeof column.accessorFn !== 'undefined' && column.getCanHide()
    ))

  return h(DropdownMenu, {}, {
    default: () => [
      h(DropdownMenuTrigger, { asChild: true }, {
        default: () => h(Button, {
          variant: 'outline',
          size: 'sm',
          class: 'hidden h-8 ml-auto lg:flex'
        }, {
          default: () => [
            h(Settings2, { class: 'w-4 h-4 mr-2' }),
            'มุมมอง'
          ]
        })
      }),
      h(DropdownMenuContent, { align: 'end', class: 'w-[200px]' }, {
        default: () => [
          h(DropdownMenuLabel, {}, { default: () => 'แสดง/ซ่อนคอลัมน์' }),
          h(DropdownMenuSeparator),
          ...columns.value.map((column: any) => 
            h(DropdownMenuCheckboxItem, {
              key: column.id,
              class: 'capitalize',
              modelValue: column.getIsVisible(),
              'onUpdate:modelValue': (value: boolean | 'indeterminate') => column.toggleVisibility(!!value)
            }, {
              default: () => column.id
            })
          ),
          h(DropdownMenuSeparator),
          h(DropdownMenuLabel, {}, { default: () => 'การกระทำคอลัมน์' }),
          h(DropdownMenuItem, {
            onClick: () => props.table.resetColumnSizing()
          }, {
            default: () => 'รีเซ็ตขนาดคอลัมน์'
          })
        ]
      })
    ]
  })
}

// DataTablePagination component function
const DataTablePagination = (props: { table: any }) => {
  return h('div', { class: 'flex items-center justify-between px-2' }, [
    h('div', { class: 'flex-1 text-sm text-muted-foreground' }, 
      `เลือก ${props.table.getFilteredSelectedRowModel().rows.length} จาก ${props.table.getFilteredRowModel().rows.length} แถว`
    ),
    h('div', { class: 'flex items-center space-x-6 lg:space-x-8' }, [
      h('div', { class: 'flex items-center space-x-2' }, [
        h('p', { class: 'text-sm font-medium' }, 'แถวต่อหน้า'),
        h(Select, {
          modelValue: `${props.table.getState().pagination.pageSize}`,
          'onUpdate:modelValue': (value: any) => props.table.setPageSize(Number(value))
        }, {
          default: () => [
            h(SelectTrigger, { class: 'h-8 w-[70px]' }, {
              default: () => h(SelectValue, { 
                placeholder: `${props.table.getState().pagination.pageSize}` 
              })
            }),
            h(SelectContent, { side: 'top' }, {
              default: () => [10, 20, 30, 40, 50].map(pageSize => 
                h(SelectItem, { 
                  key: pageSize, 
                  value: `${pageSize}` 
                }, {
                  default: () => `${pageSize}`
                })
              )
            })
          ]
        })
      ]),
      h('div', { class: 'flex w-[100px] items-center justify-center text-sm font-medium' }, 
        `หน้า ${props.table.getState().pagination.pageIndex + 1} จาก ${props.table.getPageCount()}`
      ),
      h('div', { class: 'flex items-center space-x-2' }, [
        h(Button, {
          variant: 'outline',
          class: 'hidden w-8 h-8 p-0 lg:flex',
          disabled: !props.table.getCanPreviousPage(),
          onClick: () => props.table.setPageIndex(0)
        }, {
          default: () => [
            h('span', { class: 'sr-only' }, 'ไปหน้าแรก'),
            h(ChevronsLeft, { class: 'w-4 h-4' })
          ]
        }),
        h(Button, {
          variant: 'outline',
          class: 'w-8 h-8 p-0',
          disabled: !props.table.getCanPreviousPage(),
          onClick: () => props.table.previousPage()
        }, {
          default: () => [
            h('span', { class: 'sr-only' }, 'ไปหน้าก่อน'),
            h(ChevronLeft, { class: 'w-4 h-4' })
          ]
        }),
        h(Button, {
          variant: 'outline',
          class: 'w-8 h-8 p-0',
          disabled: !props.table.getCanNextPage(),
          onClick: () => props.table.nextPage()
        }, {
          default: () => [
            h('span', { class: 'sr-only' }, 'ไปหน้าถัดไป'),
            h(ChevronRight, { class: 'w-4 h-4' })
          ]
        }),
        h(Button, {
          variant: 'outline',
          class: 'hidden w-8 h-8 p-0 lg:flex',
          disabled: !props.table.getCanNextPage(),
          onClick: () => props.table.setPageIndex(props.table.getPageCount() - 1)
        }, {
          default: () => [
            h('span', { class: 'sr-only' }, 'ไปหน้าสุดท้าย'),
            h(ChevronsRight, { class: 'w-4 h-4' })
          ]
        })
      ])
    ])
  ])
}

// ฟังก์ชันสำหรับ copy ข้อความ
function copy(id: string) {
  navigator.clipboard.writeText(id)
  toast.success(`คัดลอก ID: ${id}`)
}

// DropdownAction component function พร้อม expand support
const DropdownAction = (props: { payment: { id: string }, onExpand: () => void }) => {
  return h(DropdownMenu, {}, {
    default: () => [
      h(DropdownMenuTrigger, { asChild: true }, {
        default: () => h(Button, { 
          variant: 'ghost', 
          class: 'w-8 h-8 p-0' 
        }, {
          default: () => [
            h('span', { class: 'sr-only' }, 'เปิดเมนู'),
            h(MoreHorizontal, { class: 'w-4 h-4' })
          ]
        })
      }),
      h(DropdownMenuContent, { align: 'end' }, {
        default: () => [
          h(DropdownMenuLabel, {}, { default: () => 'การกระทำ' }),
          h(DropdownMenuItem, { 
            onClick: () => copy(props.payment.id) 
          }, { default: () => 'คัดลอก Payment ID' }),
          h(DropdownMenuItem, { 
            onClick: props.onExpand 
          }, { default: () => 'ขยายรายละเอียด' }),
          h(DropdownMenuSeparator),
          h(DropdownMenuItem, {}, { default: () => 'ดูข้อมูลลูกค้า' }),
          h(DropdownMenuItem, {}, { default: () => 'ดูรายละเอียดการชำระ' })
        ]
      })
    ]
  })
}

// Status Badge Component
const StatusBadge = (props: { status: string }) => {
  const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
    pending: 'secondary',
    processing: 'default',
    success: 'default',
    failed: 'destructive'
  }
  
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    processing: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    success: 'bg-green-100 text-green-800 hover:bg-green-100',
    failed: 'bg-red-100 text-red-800 hover:bg-red-100'
  }

  const labels = {
    pending: 'รอดำเนินการ',
    processing: 'กำลังประมวลผล',
    success: 'สำเร็จ',
    failed: 'ล้มเหลว'
  }

  return h(Badge, {
    variant: variants[props.status] || 'secondary',
    class: cn('capitalize', colors[props.status as keyof typeof colors])
  }, { 
    default: () => labels[props.status as keyof typeof labels] || props.status 
  })
}

// Column definitions ที่ปรับปรุงแล้ว
const columns: ColumnDef<Payment>[] = [
  // Select Column - ต้องอยู่นอก header groups
  {
    id: 'select',
    header: ({ table }) => h(Checkbox, {
      'modelValue': table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
      'ariaLabel': 'เลือกทั้งหมด',
    }),
    cell: ({ row }) => {
      // ไม่แสดง checkbox สำหรับแถวที่จัดกลุ่ม
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
  // Status Column ที่ปรับปรุงแล้ว
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
        const formatted = new Intl.NumberFormat('th-TH', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)

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
      // ไม่แสดง actions สำหรับแถวที่จัดกลุ่ม
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

// การจัดการข้อมูลและ state - ใช้ข้อมูลจาก props แทน hard data
const data = ref<Payment[]>(props.payments) // รับข้อมูลจาก props
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})
const columnSizing = ref<ColumnSizingState>({})
const grouping = ref<GroupingState>([])

// ฟังก์ชันช่วยเหลือสำหรับการรับความกว้างของคอลัมน์
const getColumnWidth = (columnId: string, defaultSize: number) => {
  return columnSizing.value[columnId] || defaultSize
}

// ฟังก์ชันล้างตัวกรองทั้งหมด
const clearAllFilters = () => {
  try {
    table.resetColumnFilters()
    toast.info('ล้างตัวกรองทั้งหมดแล้ว')
  } catch (error) {
    console.warn('Clear filters failed:', error)
  }
}

// นับจำนวนตัวกรองที่ใช้งานอยู่
const activeFiltersCount = computed(() => {
  try {
    return columnFilters.value.length
  } catch {
    return 0
  }
})

// นับจำนวนการจัดกลุ่มที่ใช้งานอยู่
const activeGroupingCount = computed(() => {
  try {
    return grouping.value.length
  } catch {
    return 0
  }
})

// การตั้งค่าตารางพร้อม enhanced filtering, faceting, safer grouping และ column sizing
const table = useVueTable({
  get data() { return data.value },
  get columns() { return columns },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  getFacetedMinMaxValues: getFacetedMinMaxValues(),
  getGroupedRowModel: getGroupedRowModel(), // จำเป็นสำหรับการจัดกลุ่ม
  enableColumnResizing: true,
  columnResizeMode: 'onChange',
  columnResizeDirection: 'ltr',
  enableColumnFilters: true,
  enableGrouping: true, // เปิดใช้งานการจัดกลุ่ม
  groupedColumnMode: 'reorder', // ตัวเลือก: false, 'reorder', 'remove'
  filterFns: {
    statusMultiSelect: statusMultiSelectFilter,
    amountRange: amountRangeFilter,
  },
  // ใช้ built-in aggregation functions แทนที่จะเป็น custom ones
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
  onColumnSizingChange: updaterOrValue => valueUpdater(updaterOrValue, columnSizing),
  onGroupingChange: updaterOrValue => valueUpdater(updaterOrValue, grouping),
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
    get expanded() { return expanded.value },
    get columnSizing() { return columnSizing.value },
    get grouping() { return grouping.value },
  },
})

// โหลดข้อมูลเมื่อ component ถูกสร้าง - ปรับปรุงให้ใช้ข้อมูลจาก props
onMounted(() => {
  try {
    console.log('Data loaded from props:', data.value)
    console.log('Data length:', data.value.length)
    
    // แสดง log เพื่อการตรวจสอบ
    toast.success(`โหลดข้อมูลแล้ว: ${data.value.length} รายการ`)
  } catch (error) {
    console.error('Failed to process data:', error)
    toast.error('ไม่สามารถประมวลผลข้อมูลได้')
  }
})

// Watch props changes และอัพเดทข้อมูลเมื่อ props เปลี่ยน
watch(() => props.payments, (newPayments) => {
  data.value = newPayments
  console.log('Data updated from props:', newPayments.length, 'items')
  toast.info(`อัพเดทข้อมูล: ${newPayments.length} รายการ`)
}, { immediate: true })
</script>

<template>
  <Head title="การชำระเงิน" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- Enhanced Controls Section พร้อม Multiple Filters และ Grouping -->
      <div class="flex flex-col gap-4">
        <!-- แถวตัวกรองหลัก -->
        <div class="flex items-center gap-4 flex-wrap">
          <!-- Enhanced Email Filter พร้อม Autocomplete -->
          <EmailAutocompleteFilter :column="table.getColumn('email')!" />
          
          <!-- ID Filter -->
          <Input 
            class="max-w-sm" 
            placeholder="กรองตาม ID..."
            :model-value="table.getColumn('id')?.getFilterValue() as string"
            @update:model-value="table.getColumn('id')?.setFilterValue($event)" 
          />
          
          <!-- Enhanced Column Visibility Dropdown -->
          <DataTableViewOptions :table="table" />
        </div>

        <!-- แถวตัวกรองขั้นสูงและการจัดกลุ่ม -->
        <div class="flex items-center gap-4 flex-wrap">
          <!-- ใช้ StatusFilter component ที่ import มา -->
          <StatusFilter :column="table.getColumn('status')!" />
          
          <!-- Enhanced Amount Range Filter พร้อม Faceted Min/Max -->
          <AmountRangeFilter :column="table.getColumn('amount')!" />
          
          <!-- Grouping Controls -->
          <GroupingControls :table="table" />
          
          <!-- ล้างตัวกรองทั้งหมด -->
          <Button
            v-if="activeFiltersCount > 0"
            variant="ghost"
            size="sm"
            @click="clearAllFilters"
            class="h-8"
          >
            ล้างตัวกรอง
            <Badge variant="secondary" class="ml-2 rounded-sm px-1 font-normal">
              {{ activeFiltersCount }}
            </Badge>
          </Button>
        </div>

        <!-- สรุปตัวกรองและการจัดกลุ่มที่ใช้งานอยู่ -->
        <div v-if="activeFiltersCount > 0 || activeGroupingCount > 0" class="flex items-center gap-4 text-sm text-muted-foreground">
          <div v-if="activeFiltersCount > 0" class="flex items-center gap-2">
            <Filter class="w-4 h-4" />
            <span>ใช้ตัวกรอง {{ activeFiltersCount }} ตัว</span>
          </div>
          
          <div v-if="activeGroupingCount > 0" class="flex items-center gap-2">
            <Group class="w-4 h-4" />
            <span>จัดกลุ่มโดย {{ grouping.join(', ') }}</span>
          </div>
          
          <div class="flex items-center gap-2">
            <span>•</span>
            <span>แสดง {{ table.getFilteredRowModel().rows.length }} จาก {{ data.length }} แถว</span>
          </div>
        </div>
      </div>

      <!-- ตารางพร้อม Column Resizing, Filtering และ Simple Header -->
      <div class="border rounded-md overflow-x-auto">
        <Table class="min-w-full">
          <TableHeader>
            <template v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
              <TableRow>
                <template v-for="header in headerGroup.headers" :key="header.id">
                  <TableHead 
                    :style="{ 
                      width: `${getColumnWidth(header.column.id, header.column.columnDef.size || 150)}px`,
                      position: 'relative'
                    }"
                    class="relative border-r border-border/50 last:border-r-0"
                    :class="cn(
                      header.isPlaceholder ? 'p-0' : ''
                    )"
                  >
                    <FlexRender
                      v-if="!header.isPlaceholder" 
                      :render="header.column.columnDef.header"
                      :props="header.getContext()"
                    />
                  </TableHead>
                </template>
              </TableRow>
            </template>
          </TableHeader>
          <TableBody>
            <template v-if="table.getRowModel().rows?.length">
              <template v-for="row in table.getRowModel().rows" :key="row.id">
                <!-- แถวหลัก (รวมแถวที่จัดกลุ่ม) -->
                <TableRow 
                  :data-state="row.getIsSelected() ? 'selected' : undefined"
                  :class="cn(
                    safeGetIsGrouped(row) ? 'bg-muted/30 font-medium hover:bg-muted/40' : '',
                    safeGetIsAggregated(row) ? 'bg-muted/20 font-medium hover:bg-muted/30' : ''
                  )"
                >
                  <TableCell 
                    v-for="cell in row.getVisibleCells()" 
                    :key="cell.id"
                    :style="{ 
                      width: `${getColumnWidth(cell.column.id, cell.column.columnDef.size || 150)}px`
                    }"
                    class="border-r border-border/50 last:border-r-0"
                  >
                    <FlexRender 
                      :render="cell.column.columnDef.cell" 
                      :props="cell.getContext()" 
                    />
                  </TableCell>
                </TableRow>
                
                <!-- แถวที่ขยาย (สำหรับรายละเอียดการชำระเงินแต่ละรายการ) -->
                <TableRow v-if="row.getIsExpanded && row.getIsExpanded() && !safeGetIsGrouped(row)">
                  <TableCell :colspan="row.getAllCells().length" class="bg-muted/50">
                    <div class="p-4">
                      <h4 class="font-semibold mb-2">รายละเอียดการชำระเงิน</h4>
                      <pre class="text-sm bg-background p-2 rounded border">{{ JSON.stringify(row.original, null, 2) }}</pre>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
            </template>
            <template v-else>
              <TableRow>
                <TableCell :colspan="table.getAllColumns().length" class="h-24 text-center">
                  ไม่พบผลลัพธ์ ลองปรับตัวกรองหรือการจัดกลุ่ม
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <!-- Enhanced Pagination Section -->
      <DataTablePagination :table="table" />
    </div>
  </AppLayout>
</template>

<style scoped>
/* Enhanced styles สำหรับ column resizing และ header groups */
.table-container {
  overflow-x: auto;
  min-width: 100%;
}

/* ให้แน่ใจว่า column มีพฤติกรรมที่ถูกต้อง */
th, td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
}

/* Column resize handle hover effects */
.resize-handle:hover {
  background-color: hsl(var(--primary));
}

/* Table layout optimizations */
table {
  border-collapse: separate;
  border-spacing: 0;
}

/* Grouped row styles */
.grouped-row {
  background-color: hsl(var(--muted) / 0.3);
}

.aggregated-row {
  background-color: hsl(var(--muted) / 0.2);
}
</style>
