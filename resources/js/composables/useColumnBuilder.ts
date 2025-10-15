/**
 * ไฟล์: resources/js/composables/useColumnBuilder.ts
 * คำอธิบาย: Generic Column Builder สำหรับสร้าง columns ใน Data Table
 * หน้าที่: สร้าง column definitions แบบ type-safe และ reusable
 */

import { h, type ComputedRef, computed } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTableColumnHeader } from '@/components/custom/data-table'
import { DataTableDropdown } from '@/components/custom/data-table'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { formatDate as formatDateUtil, formatCurrency, formatNumber } from '@/lib/formatters'

// ========= TYPE DEFINITIONS =========

/**
 * Base interface สำหรับ Entity ที่มี ID
 */
export interface BaseEntity {
  id: number | string
  [key: string]: any
}

/**
 * Status mapping configuration
 */
export interface StatusMapping {
  [key: string]: {
    label: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    className?: string
  }
}

/**
 * Base options สำหรับทุก column type
 */
export interface BaseColumnOptions {
  sortable?: boolean
  enableHiding?: boolean
  className?: string
  placeholder?: string
  onSort?: (field: string) => void
}

/**
 * Options สำหรับ Text Column
 */
export interface TextColumnOptions extends BaseColumnOptions {
  maxLength?: number
  transform?: (value: any) => string
}

/**
 * Options สำหรับ Date Column
 */
export interface DateColumnOptions extends BaseColumnOptions {
  includeTime?: boolean
  format?: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime'
}

/**
 * Options สำหรับ Number Column
 */
export interface NumberColumnOptions extends BaseColumnOptions {
  currency?: boolean
  precision?: number
  prefix?: string
  suffix?: string
}

/**
 * Options สำหรับ Status Column
 */
export interface StatusColumnOptions extends BaseColumnOptions {
  statusMapping?: StatusMapping
}

/**
 * Options สำหรับ ID Column
 */
export interface IdColumnOptions extends BaseColumnOptions {
  copyable?: boolean
}

/**
 * Column configuration types
 */
export type ColumnConfig<T extends BaseEntity = BaseEntity> =
  | TextColumnConfig<T>
  | DateColumnConfig<T>
  | NumberColumnConfig<T>
  | IdColumnConfig<T>
  | StatusColumnConfig<T>
  | ExpandColumnConfig
  | ActionColumnConfig<T>

export interface TextColumnConfig<T> {
  type: 'text'
  key: keyof T
  header: string
  sortable?: boolean
  enableHiding?: boolean
  className?: string
  maxLength?: number
  placeholder?: string
  transform?: (value: any) => string
}

export interface DateColumnConfig<T> {
  type: 'date'
  key: keyof T
  header: string
  sortable?: boolean
  enableHiding?: boolean
  className?: string
  includeTime?: boolean
  format?: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime'
}

export interface NumberColumnConfig<T> {
  type: 'number'
  key: keyof T
  header: string
  sortable?: boolean
  enableHiding?: boolean
  className?: string
  currency?: boolean
  precision?: number
  prefix?: string
  suffix?: string
}

export interface IdColumnConfig<T> {
  type: 'id'
  key: keyof T
  header: string
  sortable?: boolean
  enableHiding?: boolean
  className?: string
  copyable?: boolean
}

export interface StatusColumnConfig<T> {
  type: 'status'
  key: keyof T
  header: string
  sortable?: boolean
  enableHiding?: boolean
  className?: string
  statusMapping?: StatusMapping
}

export interface ExpandColumnConfig {
  type: 'expand'
  header?: string
  className?: string
}

export interface ActionColumnConfig<T> {
  type: 'action'
  header?: string
  idKey?: string
  nameKey?: string
  enableCopy?: boolean
  enableView?: boolean
  enableEdit?: boolean
  enableDelete?: boolean
  enableDownload?: boolean
  enableHiding?: boolean
  customActions?: Array<{
    key: string
    label: string
    icon?: any
    variant?: 'default' | 'destructive' | 'ghost'
    separator?: boolean
  }>
}

/**
 * Callbacks สำหรับ CRUD operations
 */
export interface ColumnCallbacks<T extends BaseEntity = BaseEntity> {
  onSort?: (field: string) => void
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onCustomAction?: (actionKey: string, item: T) => void
}

/**
 * Return type ของ column
 */
export type TableColumn<T> = ColumnDef<T, any>

// ========= HELPER FUNCTIONS =========

/**
 * Truncate text และเพิ่ม ellipsis
 */
function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - suffix.length) + suffix
}

/**
 * Format date wrapper
 */
function formatDate(
  date: string | Date | null | undefined,
  formatType: 'short' | 'medium' | 'long' | 'full' | 'time' | 'datetime' = 'short'
): string {
  if (!date) return '-'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date)
      return '-'
    }

    const locale = 'th-TH'

    switch (formatType) {
      case 'short':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(dateObj)

      case 'medium':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(dateObj)

      case 'long':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(dateObj)

      case 'full':
      case 'datetime':
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(dateObj)

      case 'time':
        return new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
        }).format(dateObj)

      default:
        return dateObj.toLocaleDateString(locale)
    }
  } catch (error) {
    console.error('Date formatting error:', error)
    return '-'
  }
}

// ========= MAIN COMPOSABLE =========

/**
 * Generic Column Builder Composable
 * @template T - Entity type ที่ extends BaseEntity
 */
export function useColumnBuilder<T extends BaseEntity = BaseEntity>() {
  
  // ======= PRIVATE HELPER FUNCTIONS =======

  /**
   * สร้าง sortable header component
   */
  const createSortableHeader = (
    label: string,
    field: string,
    onSort?: (field: string) => void
  ) => {
    return (props: any) =>
      h(DataTableColumnHeader, {
        column: props.column,
        title: label,
        onSort: onSort ? () => onSort(field) : undefined,
      })
  }

  /**
   * ดึงค่าจาก nested object path
   */
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
  }

  // ======= COLUMN CREATORS =======

  /**
   * สร้าง Expand Column สำหรับ expandable rows
   */
  const createExpandColumn = (header: string = ''): TableColumn<T> => {
    return {
      id: 'expand',
      header: () => header,
      cell: ({ row }) => {
        return h(
          Button,
          {
            variant: 'ghost',
            size: 'sm',
            onClick: () => row.toggleExpanded(),
            class: 'p-0 w-8 h-8',
          },
          {
            default: () =>
              h(row.getIsExpanded() ? ChevronDown : ChevronRight, {
                class: 'h-4 w-4',
              }),
          }
        )
      },
      enableHiding: false,
      enableSorting: false,
    }
  }

  /**
   * สร้าง Text Column
   */
  const createTextColumn = (
    key: keyof T,
    header: string,
    options: TextColumnOptions = {}
  ): TableColumn<T> => {
    const {
      sortable = true,
      maxLength,
      placeholder = '-',
      transform,
      onSort,
      enableHiding = true,
      className = '',
    } = options

    return {
      id: String(key),
      accessorKey: key as string,
      header: sortable && onSort 
        ? createSortableHeader(header, String(key), onSort)
        : () => header,
      cell: ({ row }) => {
        let value = getNestedValue(row.original, String(key))
        
        // Apply custom transform
        if (transform) {
          value = transform(value)
        }
        
        // Handle null/undefined
        if (value === null || value === undefined || value === '') {
          return h('span', { class: 'text-muted-foreground text-sm' }, placeholder)
        }
        
        // Truncate if maxLength specified
        const displayValue = maxLength 
          ? truncateText(String(value), maxLength)
          : String(value)
        
        return h('div', { class: `text-sm ${className}` }, displayValue)
      },
      enableSorting: sortable,
      enableHiding,
      meta: {
        displayName: header,
        className,
      },
    }
  }

  /**
   * สร้าง Date Column
   */
  const createDateColumn = (
    key: keyof T,
    header: string,
    options: DateColumnOptions = {}
  ): TableColumn<T> => {
    const {
      sortable = true,
      includeTime = false,
      format = 'short',
      onSort,
      enableHiding = true,
      className = '',
      placeholder = '-',
    } = options

    return {
      id: String(key),
      accessorKey: key as string,
      header: sortable && onSort
        ? createSortableHeader(header, String(key), onSort)
        : () => header,
      cell: ({ row }) => {
        const value = getNestedValue(row.original, String(key))
        
        if (!value) {
          return h('span', { class: 'text-muted-foreground text-sm' }, placeholder)
        }

        const formatType = includeTime ? 'datetime' : (format || 'short')
        const formatted = formatDate(value, formatType)

        return h('div', { class: `text-sm ${className}` }, formatted)
      },
      enableSorting: sortable,
      enableHiding,
      meta: {
        displayName: header,
        className,
      },
    }
  }

  /**
   * สร้าง Number Column
   */
  const createNumberColumn = (
    key: keyof T,
    header: string,
    options: NumberColumnOptions = {}
  ): TableColumn<T> => {
    const {
      sortable = true,
      currency = false,
      precision = 2,
      prefix = '',
      suffix = '',
      onSort,
      enableHiding = true,
      className = 'text-right',
      placeholder = '-',
    } = options

    return {
      id: String(key),
      accessorKey: key as string,
      header: sortable && onSort
        ? createSortableHeader(header, String(key), onSort)
        : () => header,
      cell: ({ row }) => {
        const value = getNestedValue(row.original, String(key))
        
        if (value === null || value === undefined) {
          return h('span', { class: 'text-muted-foreground text-sm' }, placeholder)
        }

        const formatted = currency
          ? formatCurrency(Number(value))
          : formatNumber(Number(value), 'th-TH', {
              minimumFractionDigits: precision,
              maximumFractionDigits: precision,
            })

        const displayValue = `${prefix}${formatted}${suffix}`

        return h('div', { class: `text-sm font-medium ${className}` }, displayValue)
      },
      enableSorting: sortable,
      enableHiding,
      meta: {
        displayName: header,
        className,
      },
    }
  }

  /**
   * สร้าง ID Column (พิเศษสำหรับ ID fields)
   */
  const createIdColumn = (
    key: keyof T,
    header: string,
    options: IdColumnOptions = {}
  ): TableColumn<T> => {
    const {
      sortable = true,
      onSort,
      enableHiding = true,
      className = 'font-mono text-xs',
      placeholder = '-',
    } = options

    return {
      id: String(key),
      accessorKey: key as string,
      header: sortable && onSort
        ? createSortableHeader(header, String(key), onSort)
        : () => header,
      cell: ({ row }) => {
        const value = getNestedValue(row.original, String(key))
        
        if (!value) {
          return h('span', { class: 'text-muted-foreground text-sm' }, placeholder)
        }

        return h('code', { class: `text-xs ${className}` }, String(value))
      },
      enableSorting: sortable,
      enableHiding,
      meta: {
        displayName: header,
        className,
      },
    }
  }

  /**
   * สร้าง Status Column พร้อม Badge
   */
  const createStatusColumn = (
    key: keyof T,
    header: string,
    options: StatusColumnOptions = {}
  ): TableColumn<T> => {
    const {
      sortable = true,
      statusMapping,
      onSort,
      enableHiding = true,
      className = '',
      placeholder = '-',
    } = options

    return {
      id: String(key),
      accessorKey: key as string,
      header: sortable && onSort
        ? createSortableHeader(header, String(key), onSort)
        : () => header,
      cell: ({ row }) => {
        const value = getNestedValue(row.original, String(key))
        
        if (!value) {
          return h('span', { class: 'text-muted-foreground text-sm' }, placeholder)
        }

        const status = statusMapping?.[value] || {
          label: String(value),
          variant: 'secondary' as const,
        }

        // สร้าง Badge-like element
        return h('span', { 
          class: `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${status.className || ''}` 
        }, status.label)
      },
      enableSorting: sortable,
      enableHiding,
      enableColumnFilter: true,
      meta: {
        displayName: header,
        className,
      },
    }
  }

  /**
   * สร้าง Action Column
   */
  const createActionColumn = (
    renderFn: (item: T) => any,
    header: string = '',
    options: { enableHiding?: boolean } = {}
  ): TableColumn<T> => {
    return {
      id: 'actions',
      header: () => header,
      cell: ({ row }) => renderFn(row.original),
      enableHiding: options.enableHiding ?? false,
      enableSorting: false,
      meta: {
        displayName: 'การดำเนินการ',
      },
    }
  }

  // ======= BATCH COLUMN CREATOR =======

  /**
   * สร้าง columns หลายๆ column พร้อมกัน
   */
  const createColumns = (
    configs: ColumnConfig<T>[],
    callbacks: ColumnCallbacks<T> = {}
  ): ComputedRef<TableColumn<T>[]> => {
    
    return computed(() => {
      return configs.map(config => {
        switch (config.type) {
          case 'expand':
            return createExpandColumn(config.header)

          case 'id':
            return createIdColumn(
              config.key, 
              config.header, 
              {
                sortable: config.sortable,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className,
                copyable: config.copyable,
              }
            )

          case 'text':
            return createTextColumn(
              config.key,
              config.header,
              {
                sortable: config.sortable,
                maxLength: config.maxLength,
                placeholder: config.placeholder,
                transform: config.transform,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className,
              }
            )

          case 'date':
            return createDateColumn(
              config.key,
              config.header,
              {
                sortable: config.sortable,
                includeTime: config.includeTime,
                format: config.format,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className,
              }
            )

          case 'number':
            return createNumberColumn(
              config.key,
              config.header,
              {
                sortable: config.sortable,
                currency: config.currency,
                precision: config.precision,
                prefix: config.prefix,
                suffix: config.suffix,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className,
              }
            )

          case 'status':
            return createStatusColumn(
              config.key,
              config.header,
              {
                sortable: config.sortable,
                statusMapping: config.statusMapping,
                onSort: callbacks.onSort,
                enableHiding: config.enableHiding,
                className: config.className,
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
    actionOptions?: Partial<ActionColumnConfig<T>>
  }) => {
    
    const columnConfigs: ColumnConfig<T>[] = []

    // Add expand column
    if (config.enableExpand) {
      columnConfigs.push({ type: 'expand' })
    }

    // Add ID column
    if (config.enableId) {
      columnConfigs.push({
        type: 'id',
        key: 'id' as keyof T,
        header: 'ID',
        sortable: true,
        enableHiding: true
      })
    }

    // Add field columns
    const fieldColumns: ColumnConfig<T>[] = config.fields.map(field => ({
      type: (field.type || 'text') as any,
      key: field.key as keyof T,
      header: field.header,
      sortable: true,
      enableHiding: true,
      ...field.options
    }))
    columnConfigs.push(...fieldColumns)

    // Add action column
    if (config.enableActions) {
      columnConfigs.push({
        type: 'action',
        enableHiding: false,
        ...config.actionOptions
      } as ActionColumnConfig<T>)
    }

    return columnConfigs
  }

  // ======= RETURN PUBLIC API =======
  
  return {
    // Single column creators
    createSortableHeader,
    createExpandColumn,
    createTextColumn,
    createDateColumn,
    createNumberColumn,
    createIdColumn,
    createStatusColumn,
    createActionColumn,
    
    // Batch creators
    createColumns,
    createCrudColumns
  }
}
