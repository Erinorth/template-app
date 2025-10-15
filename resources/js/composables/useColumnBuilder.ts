import { h, computed, type ComputedRef, type Component } from 'vue'
import { Button } from '@/components/ui/button'
import { DataTableDropdown } from '@/components/custom/data-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { ArrowUpDown, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { formatDate, formatDateTime, formatCurrency, formatNumber, truncateText } from '@/lib/utils'
import type { TableColumn } from '@/types/table'

// ======= TYPES & INTERFACES =======

interface BaseColumnOptions {
  sortable?: boolean
  className?: string
  onSort?: (col: string) => void
  enableHiding?: boolean 
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

// Configuration-based column types
interface BaseColumnConfig {
  key: string
  header: string
  sortable?: boolean
  enableHiding?: boolean
  className?: string
}

interface TextColumnConfig extends BaseColumnConfig {
  type: 'text'
  maxLength?: number
}

interface DateColumnConfig extends BaseColumnConfig {
  type: 'date'
  includeTime?: boolean
}

interface NumberColumnConfig extends BaseColumnConfig {
  type: 'number'
  currency?: boolean
  precision?: number
}

interface IdColumnConfig extends BaseColumnConfig {
  type: 'id'
}

interface StatusColumnConfig extends BaseColumnConfig {
  type: 'status'
  statusMapping: Record<string, { label: string; className: string }>
}

interface ExpandColumnConfig {
  type: 'expand'
  header?: string
}

interface ActionColumnConfig {
  type: 'action'
  header?: string
  enableHiding?: boolean
  idKey?: string
  nameKey?: string
  enableCopy?: boolean
  enableView?: boolean
  enableEdit?: boolean
  enableDelete?: boolean
  enableDownload?: boolean
  customActions?: Array<{
    key: string
    label: string
    icon?: Component
    variant?: 'default' | 'destructive' | 'ghost'
    className?: string
    disabled?: boolean
    visible?: boolean
    separator?: boolean
  }>
}

type ColumnConfig = 
  | TextColumnConfig 
  | DateColumnConfig 
  | NumberColumnConfig 
  | IdColumnConfig 
  | StatusColumnConfig 
  | ExpandColumnConfig
  | ActionColumnConfig

interface ColumnCallbacks<T> {
  onSort?: (field: string) => void
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onCustomAction?: (actionKey: string, item: T) => void
}

// ======= MAIN COMPOSABLE =======

/**
 * All-in-One Column Builder Composable
 * รองรับทั้งการสร้าง column แบบ manual และ configuration-based
 */
export function useColumnBuilder<T extends Record<string, any>>() {
  
  // ======= HELPER FUNCTIONS =======
  
  const createSortableHeader = (
    columnId: string, 
    displayName: string,
    onSort?: (col: string) => void
  ) => {
    const headerComponent = () =>
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
    
    ;(headerComponent as any).displayName = displayName
    return headerComponent
  }

  // ======= INDIVIDUAL COLUMN CREATORS (Manual Method) =======

  const createExpandColumn = (header?: string): ColumnDef<T, any> => {
    return {
      id: 'expand',
      header: header || '',
      size: 50,
      enableSorting: false,
      enableHiding: false,
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
      
      meta: { displayName: header },
      enableHiding: options?.enableHiding ?? true,
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
      
      meta: { displayName: header },
      enableHiding: options?.enableHiding ?? true,
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
      
      meta: { displayName: header },
      enableHiding: options?.enableHiding ?? true,
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
      
      meta: { displayName: header },
      enableHiding: options?.enableHiding ?? true,
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
      
      meta: { displayName: header },
      enableHiding: options?.enableHiding ?? true,
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
    meta: { displayName: header || 'Actions' },
    enableSorting: false,
    enableHiding: options?.enableHiding ?? false,
    cell: ({ row }) => cellRenderer(row.original as R)
  })

  // ======= CONFIGURATION-BASED METHODS =======

  /**
   * สร้าง columns จาก configuration array
   * @param configs - Array ของ column configurations
   * @param callbacks - Callback functions สำหรับ actions
   */
  const createColumns = (
    configs: ColumnConfig[],
    callbacks: ColumnCallbacks<T> = {}
  ): ComputedRef<TableColumn<T>[]> => {
    
    return computed(() => {
      return configs.map(config => {
        switch (config.type) {
          case 'expand':
            return createExpandColumn(config.header)

          case 'id':
            return createIdColumn(
              config.key as keyof T, 
              config.header, 
              {
                sortable: config.sortable,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className
              }
            )

          case 'text':
            return createTextColumn(
              config.key as keyof T,
              config.header,
              {
                sortable: config.sortable,
                maxLength: config.maxLength,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className
              }
            )

          case 'date':
            return createDateColumn(
              config.key as keyof T,
              config.header,
              {
                sortable: config.sortable,
                includeTime: config.includeTime,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className
              }
            )

          case 'number':
            return createNumberColumn(
              config.key as keyof T,
              config.header,
              {
                sortable: config.sortable,
                currency: config.currency,
                precision: config.precision,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className
              }
            )

          case 'status':
            return createStatusColumn(
              config.key as keyof T,
              config.header,
              {
                sortable: config.sortable,
                statusMapping: config.statusMapping,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className
              }
            )

          case 'action':
            return createActionColumn(
              (item: T) => 
                h(DataTableDropdown, {
                  item,
                  idKey: config.idKey || 'id',
                  nameKey: config.nameKey || 'name',
                  enableCopy: config.enableCopy ?? true,
                  enableView: config.enableView ?? true,
                  enableEdit: config.enableEdit ?? true,
                  enableDelete: config.enableDelete ?? false,
                  enableDownload: config.enableDownload ?? false,
                  actions: config.customActions || [],
                  
                  onView: (item: any) => callbacks.onView?.(item as T),
                  onEdit: (item: any) => callbacks.onEdit?.(item as T),
                  onDelete: (item: any) => callbacks.onDelete?.(item as T),
                  onAction: (actionKey: string, item: any) => 
                    callbacks.onCustomAction?.(actionKey, item as T)
                }),
              config.header || '',
              { enableHiding: config.enableHiding ?? false }
            )

          default:
            throw new Error(`Unsupported column type: ${(config as any).type}`)
        }
      })
    })
  }

  // ======= QUICK HELPERS =======

  /**
   * สร้าง CRUD columns แบบเร็ว
   * @param config - การตั้งค่าพื้นฐาน
   */
  const createCrudColumns = (config: {
    fields: Array<{
      key: string
      header: string
      type?: 'text' | 'date' | 'number' | 'status'
      options?: Record<string, any>
    }>
    enableExpand?: boolean
    enableId?: boolean
    enableActions?: boolean
    actionOptions?: {
      enableCopy?: boolean
      enableView?: boolean
      enableEdit?: boolean
      enableDelete?: boolean
      customActions?: Array<{
        key: string
        label: string
        separator?: boolean
      }>
    }
  }) => {
    
    const columnConfigs: ColumnConfig[] = []

    // Expand column
    if (config.enableExpand) {
      columnConfigs.push({ type: 'expand' })
    }

    // ID column
    if (config.enableId) {
      columnConfigs.push({
        type: 'id',
        key: 'id',
        header: 'ID',
        sortable: true,
        enableHiding: true
      })
    }

    // Field columns
    const fieldColumns: ColumnConfig[] = config.fields.map(field => ({
      type: (field.type || 'text') as any,
      key: field.key,
      header: field.header,
      sortable: true,
      enableHiding: true,
      ...field.options
    }))
    columnConfigs.push(...fieldColumns)

    // Action column
    if (config.enableActions) {
      columnConfigs.push({
        type: 'action',
        enableHiding: false,
        ...config.actionOptions
      })
    }

    return columnConfigs
  }

  // ======= RETURN VALUES =======
  
  return {
    // ===== Manual Methods (เหมือนเดิม) =====
    createSortableHeader,
    createExpandColumn,
    createTextColumn,
    createDateColumn,
    createNumberColumn,
    createIdColumn,
    createStatusColumn,
    createActionColumn,
    
    // ===== Configuration Methods (ใหม่) =====
    createColumns,
    createCrudColumns
  }
}

// ======= EXPORT TYPES =======
export type {
  ColumnConfig,
  ColumnCallbacks,
  TextColumnConfig,
  DateColumnConfig,
  NumberColumnConfig,
  IdColumnConfig,
  StatusColumnConfig,
  ExpandColumnConfig,
  ActionColumnConfig,
  BaseColumnOptions,
  TextColumnOptions,
  DateColumnOptions,
  NumberColumnOptions,
  StatusColumnOptions,
  IdColumnOptions
}
