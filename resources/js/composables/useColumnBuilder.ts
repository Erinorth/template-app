// ไฟล์: resources/js/composables/useColumnBuilder.ts
// ปรับปรุง Column Builder ให้เป็น Factory Pattern ที่เป็นระบบและ Type-Safe มากขึ้น

import { h, computed, type ComputedRef, type Component } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ChevronRight, ChevronDown } from 'lucide-vue-next'
import { DataTableDropdown } from '@/components/custom/data-table'
import { 
  formatDate, 
  formatDateTime, 
  formatCurrency, 
  formatNumber, 
  truncateText 
} from '@/lib/formatters'

// ======= TYPE DEFINITIONS =======

/**
 * Base options สำหรับทุก column type
 */
interface BaseColumnOptions {
  /** สามารถ sort ได้หรือไม่ */
  sortable?: boolean
  
  /** CSS className เพิ่มเติม */
  className?: string
  
  /** สามารถซ่อน column ได้หรือไม่ */
  enableHiding?: boolean
  
  /** Meta data เพิ่มเติม */
  meta?: Record<string, any>
}

/**
 * Options เฉพาะสำหรับ Text Column
 */
interface TextColumnOptions extends BaseColumnOptions {
  /** ความยาวสูงสุดของข้อความที่จะแสดง */
  maxLength?: number
  
  /** ข้อความแสดงเมื่อค่าเป็น null/undefined */
  placeholder?: string
  
  /** Transform function สำหรับข้อความ */
  transform?: (value: string) => string
}

/**
 * Options เฉพาะสำหรับ Date Column
 */
interface DateColumnOptions extends BaseColumnOptions {
  /** แสดงเวลาด้วยหรือไม่ */
  includeTime?: boolean
  
  /** รูปแบบการแสดงผล */
  format?: 'short' | 'long' | 'custom'
  
  /** Custom format function */
  customFormat?: (date: string) => string
  
  /** Locale สำหรับแสดงผล */
  locale?: string
}

/**
 * Options เฉพาะสำหรับ Number Column
 */
interface NumberColumnOptions extends BaseColumnOptions {
  /** แสดงเป็นสกุลเงินหรือไม่ */
  currency?: boolean
  
  /** จำนวนทศนิยม */
  precision?: number
  
  /** จัดวางข้อความ */
  align?: 'left' | 'center' | 'right'
  
  /** สกุลเงิน (default: 'THB') */
  currencyCode?: string
  
  /** Locale สำหรับแสดงผล */
  locale?: string
  
  /** Prefix สำหรับหน่วย (เช่น '$', '฿') */
  prefix?: string
  
  /** Suffix สำหรับหน่วย (เช่น '%', 'บาท') */
  suffix?: string
}

/**
 * Status Config สำหรับแต่ละสถานะ
 */
interface StatusConfig {
  /** Label ที่จะแสดง */
  label: string
  
  /** CSS className */
  className: string
  
  /** Icon component (optional) */
  icon?: Component
  
  /** Badge variant */
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

/**
 * Options เฉพาะสำหรับ Status Column
 */
interface StatusColumnOptions extends BaseColumnOptions {
  /** Mapping ระหว่าง value กับ status config */
  statusMapping: Record<string, StatusConfig>
  
  /** Default status config สำหรับค่าที่ไม่มีใน mapping */
  defaultStatus?: StatusConfig
}

/**
 * Custom Action สำหรับ Action Column
 */
interface CustomAction {
  /** Key สำหรับระบุ action */
  key: string
  
  /** Label ที่จะแสดง */
  label: string
  
  /** Icon component */
  icon?: Component
  
  /** Variant ของปุ่ม */
  variant?: 'default' | 'destructive' | 'ghost'
  
  /** CSS className เพิ่มเติม */
  className?: string
  
  /** Disabled หรือไม่ */
  disabled?: boolean
  
  /** แสดงหรือไม่ */
  visible?: boolean
  
  /** แสดง separator ก่อน action นี้หรือไม่ */
  separator?: boolean
}

/**
 * Options เฉพาะสำหรับ Action Column
 */
interface ActionColumnOptions {
  /** Header ของ column */
  header?: string
  
  /** สามารถซ่อนได้หรือไม่ */
  enableHiding?: boolean
  
  /** Key สำหรับ ID field */
  idKey?: string
  
  /** Key สำหรับ Name field */
  nameKey?: string
  
  /** เปิดใช้งาน Copy action */
  enableCopy?: boolean
  
  /** เปิดใช้งาน View action */
  enableView?: boolean
  
  /** เปิดใช้งาน Edit action */
  enableEdit?: boolean
  
  /** เปิดใช้งาน Delete action */
  enableDelete?: boolean
  
  /** เปิดใช้งาน Download action */
  enableDownload?: boolean
  
  /** Custom actions เพิ่มเติม */
  customActions?: CustomAction[]
  
  /** Menu label */
  menuLabel?: string
}

/**
 * Options เฉพาะสำหรับ Expand Column
 */
interface ExpandColumnOptions {
  /** Header ของ column */
  header?: string
  
  /** Icon สำหรับแสดง expand/collapse */
  expandIcon?: Component
  
  /** Icon สำหรับแสดง collapse */
  collapseIcon?: Component
}

// ======= COLUMN CONFIG TYPES =======

/**
 * Base Column Config
 */
interface BaseColumnConfig {
  /** Accessor key สำหรับเข้าถึงข้อมูล */
  key: string
  
  /** Header ที่จะแสดง */
  header: string
}

/**
 * Union type สำหรับ Column Config ทั้งหมด
 */
type ColumnConfig<T = any> =
  | ({ type: 'expand' } & Partial<ExpandColumnOptions>)
  | ({ type: 'id' } & BaseColumnConfig & Partial<BaseColumnOptions>)
  | ({ type: 'text' } & BaseColumnConfig & Partial<TextColumnOptions>)
  | ({ type: 'date' } & BaseColumnConfig & Partial<DateColumnOptions>)
  | ({ type: 'number' } & BaseColumnConfig & Partial<NumberColumnOptions>)
  | ({ type: 'status' } & BaseColumnConfig & StatusColumnOptions)
  | ({ type: 'action' } & ActionColumnOptions)

/**
 * Callbacks สำหรับ actions ต่างๆ
 */
interface ColumnCallbacks<T> {
  /** Callback เมื่อ sort column */
  onSort?: (field: string) => void
  
  /** Callback เมื่อดูรายละเอียด */
  onView?: (item: T) => void
  
  /** Callback เมื่อแก้ไข */
  onEdit?: (item: T) => void
  
  /** Callback เมื่อลบ */
  onDelete?: (item: T) => void
  
  /** Callback เมื่อดาวน์โหลด */
  onDownload?: (item: T) => void
  
  /** Callback สำหรับ custom actions */
  onCustomAction?: (actionKey: string, item: T) => void
}

/**
 * Return type ของ useColumnBuilder
 */
interface ColumnBuilderReturn<T> {
  /** สร้าง sortable header component */
  createSortableHeader: (
    columnId: string,
    displayName: string,
    onSort?: (col: string) => void
  ) => any
  
  /** สร้าง expand column */
  createExpandColumn: (options?: ExpandColumnOptions) => ColumnDef<T, any>
  
  /** สร้าง text column */
  createTextColumn: (
    accessorKey: keyof T,
    header: string,
    options?: TextColumnOptions
  ) => ColumnDef<T, any>
  
  /** สร้าง date column */
  createDateColumn: (
    accessorKey: keyof T,
    header: string,
    options?: DateColumnOptions
  ) => ColumnDef<T, any>
  
  /** สร้าง number column */
  createNumberColumn: (
    accessorKey: keyof T,
    header: string,
    options?: NumberColumnOptions
  ) => ColumnDef<T, any>
  
  /** สร้าง ID column */
  createIdColumn: (
    accessorKey: keyof T,
    header: string,
    options?: BaseColumnOptions
  ) => ColumnDef<T, any>
  
  /** สร้าง status column */
  createStatusColumn: (
    accessorKey: keyof T,
    header: string,
    options: StatusColumnOptions
  ) => ColumnDef<T, any>
  
  /** สร้าง action column */
  createActionColumn: <R>(
    cellRenderer: (row: R) => any,
    header?: string,
    options?: { enableHiding?: boolean }
  ) => ColumnDef<R, unknown>
  
  /** สร้าง columns จาก config array */
  createColumns: (
    configs: ColumnConfig<T>[],
    callbacks?: ColumnCallbacks<T>
  ) => ComputedRef<ColumnDef<T, any>[]>
  
  /** Quick helper สำหรับสร้าง CRUD columns */
  createCrudColumns: (config: CrudColumnsConfig<T>) => ColumnConfig<T>[]
}

/**
 * Config สำหรับ createCrudColumns
 */
interface CrudColumnsConfig<T> {
  /** Field definitions */
  fields: Array<{
    key: string
    header: string
    type?: 'text' | 'date' | 'number' | 'status'
    options?: Record<string, any>
  }>
  
  /** เปิดใช้งาน expand column */
  enableExpand?: boolean
  
  /** เปิดใช้งาน ID column */
  enableId?: boolean
  
  /** เปิดใช้งาน action column */
  enableActions?: boolean
  
  /** Options สำหรับ action column */
  actionOptions?: ActionColumnOptions
}

// ======= MAIN COMPOSABLE =======

/**
 * Composable สำหรับสร้าง table columns แบบ declarative
 * 
 * @example
 * const { createColumns } = useColumnBuilder<User>()
 * 
 * const columns = createColumns([
 *   { type: 'expand' },
 *   { type: 'id', key: 'id', header: 'ID' },
 *   { type: 'text', key: 'name', header: 'Name' },
 *   { type: 'date', key: 'created_at', header: 'Created' },
 *   { type: 'action' }
 * ], {
 *   onView: (user) => console.log(user),
 *   onEdit: (user) => console.log(user)
 * })
 */
export function useColumnBuilder<T extends Record<string, any>>(): ColumnBuilderReturn<T> {
  console.log('🏗️ useColumnBuilder: Initializing column builder')

  // ======= HEADER CREATORS =======

  /**
   * สร้าง sortable header component
   */
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
          onClick: () => {
            console.log(`🔄 Column sort clicked: ${columnId}`)
            onSort?.(columnId)
          },
          class: 'justify-start text-left p-2 h-auto font-medium hover:bg-gray-100 w-full min-w-0 text-xs sm:text-sm',
        },
        () => [
          displayName,
          h(ArrowUpDown, { class: 'ml-1 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0' }),
        ]
      )

    // เพิ่ม displayName สำหรับ DataTableViewOption
    ;(headerComponent as any).displayName = displayName
    
    return headerComponent
  }

  // ======= COLUMN CREATORS =======

  /**
   * สร้าง Expand Column
   */
  const createExpandColumn = (options: ExpandColumnOptions = {}): ColumnDef<T, any> => {
    console.log('➕ Creating expand column')
    
    const ExpandIcon = options.expandIcon || ChevronRight
    const CollapseIcon = options.collapseIcon || ChevronDown

    return {
      id: 'expand',
      header: options.header || '',
      size: 50,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) =>
        h('div', { class: 'flex justify-center' }, [
          h(
            Button,
            {
              variant: 'ghost',
              size: 'sm',
              onClick: () => {
                row.toggleExpanded()
                console.log(`🔽 Row ${row.id} expanded:`, row.getIsExpanded())
              },
              class: 'p-1 h-7 w-7',
              'aria-label': row.getIsExpanded() ? 'ย่อแถว' : 'ขยายแถว',
            },
            () => [
              h(row.getIsExpanded() ? CollapseIcon : ExpandIcon, { 
                class: 'h-4 w-4' 
              })
            ]
          ),
        ]),
    }
  }

  /**
   * สร้าง Text Column
   */
  const createTextColumn = (
    accessorKey: keyof T,
    header: string,
    options: TextColumnOptions = {}
  ): ColumnDef<T, any> => {
    console.log(`📝 Creating text column: ${String(accessorKey)}`)

    return {
      accessorKey: accessorKey as string,
      header: options.sortable
        ? createSortableHeader(accessorKey as string, header, (col) => {
            console.log(`📝 Text column "${col}" sort requested`)
          })
        : header,
      meta: { displayName: header },
      enableHiding: options.enableHiding ?? true,
      cell: ({ getValue }) => {
        let value = getValue() as string | null
        
        // Transform ถ้ามี
        if (value && options.transform) {
          value = options.transform(value)
        }
        
        const displayValue = value || (options.placeholder ?? '-')
        const finalValue = options.maxLength 
          ? truncateText(displayValue, options.maxLength) 
          : displayValue

        return h(
          'div',
          {
            class: `text-xs sm:text-sm px-2 py-1 ${options.className || ''}`,
            title: options.maxLength && value ? value : undefined,
          },
          finalValue
        )
      },
    }
  }

  /**
   * สร้าง Date Column
   */
  const createDateColumn = (
    accessorKey: keyof T,
    header: string,
    options: DateColumnOptions = {}
  ): ColumnDef<T, any> => {
    console.log(`📅 Creating date column: ${String(accessorKey)}`)

    return {
      accessorKey: accessorKey as string,
      header: options.sortable
        ? createSortableHeader(accessorKey as string, header, (col) => {
            console.log(`📅 Date column "${col}" sort requested`)
          })
        : header,
      meta: { displayName: header },
      enableHiding: options.enableHiding ?? true,
      cell: ({ getValue }) => {
        const value = getValue() as string | null
        let displayValue = '-'

        if (value) {
          if (options.customFormat) {
            displayValue = options.customFormat(value)
          } else if (options.includeTime) {
            displayValue = formatDateTime(value, options.locale)
          } else {
            displayValue = formatDate(value, options.locale)
          }
        }

        return h(
          'div',
          { class: `text-xs sm:text-sm px-2 py-1 ${options.className || ''}` },
          displayValue
        )
      },
    }
  }

  /**
   * สร้าง Number Column
   */
  const createNumberColumn = (
    accessorKey: keyof T,
    header: string,
    options: NumberColumnOptions = {}
  ): ColumnDef<T, any> => {
    console.log(`🔢 Creating number column: ${String(accessorKey)}`)

    return {
      accessorKey: accessorKey as string,
      header: options.sortable
        ? createSortableHeader(accessorKey as string, header, (col) => {
            console.log(`🔢 Number column "${col}" sort requested`)
          })
        : header,
      meta: { displayName: header },
      enableHiding: options.enableHiding ?? true,
      cell: ({ getValue }) => {
        const value = getValue() as number | null
        let displayValue = '-'

        if (typeof value === 'number') {
          if (options.currency) {
            displayValue = formatCurrency(
              value,
              options.currencyCode || 'THB',
              options.locale || 'th-TH'
            )
          } else {
            displayValue = formatNumber(value, options.locale || 'th-TH', {
              minimumFractionDigits: options.precision ?? 0,
              maximumFractionDigits: options.precision ?? 2,
            })
            
            // เพิ่ม prefix/suffix ถ้ามี
            if (options.prefix) displayValue = options.prefix + displayValue
            if (options.suffix) displayValue = displayValue + options.suffix
          }
        }

        const align = options.align || 'right'
        return h(
          'div',
          { 
            class: `text-xs sm:text-sm px-2 py-1 text-${align} ${options.className || ''}` 
          },
          displayValue
        )
      },
    }
  }

  /**
   * สร้าง ID Column
   */
  const createIdColumn = (
    accessorKey: keyof T,
    header: string,
    options: BaseColumnOptions = {}
  ): ColumnDef<T, any> => {
    console.log(`🆔 Creating ID column: ${String(accessorKey)}`)

    return {
      accessorKey: accessorKey as string,
      header: options.sortable
        ? createSortableHeader(accessorKey as string, header, (col) => {
            console.log(`🆔 ID column "${col}" sort requested`)
          })
        : header,
      meta: { displayName: header },
      enableHiding: options.enableHiding ?? true,
      cell: ({ row }) =>
        h(
          'div',
          { class: `text-xs sm:text-sm font-mono text-gray-600 px-2 py-1 ${options.className || ''}` },
          row.getValue(accessorKey as string)
        ),
    }
  }

  /**
   * สร้าง Status Column
   */
  const createStatusColumn = (
    accessorKey: keyof T,
    header: string,
    options: StatusColumnOptions
  ): ColumnDef<T, any> => {
    console.log(`🏷️ Creating status column: ${String(accessorKey)}`)

    return {
      accessorKey: accessorKey as string,
      header: options.sortable
        ? createSortableHeader(accessorKey as string, header, (col) => {
            console.log(`🏷️ Status column "${col}" sort requested`)
          })
        : header,
      meta: { displayName: header },
      enableHiding: options.enableHiding ?? true,
      cell: ({ getValue }) => {
        const value = getValue() as string | null
        const statusConfig = value 
          ? options.statusMapping[value] 
          : options.defaultStatus

        if (!statusConfig) {
          return h('div', { class: 'px-2 py-1' }, '-')
        }

        return h('div', { class: 'px-2 py-1' }, [
          h(
            'span',
            {
              class: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`,
            },
            [
              statusConfig.icon ? h(statusConfig.icon, { class: 'h-3 w-3 mr-1' }) : null,
              statusConfig.label,
            ]
          ),
        ])
      },
    }
  }

  /**
   * สร้าง Action Column
   */
  const createActionColumn = <R,>(
    cellRenderer: (row: R) => any,
    header = '',
    options?: { enableHiding?: boolean }
  ): ColumnDef<R, unknown> => {
    console.log('⚙️ Creating action column')

    return {
      id: 'actions',
      header,
      meta: { displayName: header || 'Actions' },
      enableSorting: false,
      enableHiding: options?.enableHiding ?? false,
      cell: ({ row }) => cellRenderer(row.original as R),
    }
  }

  // ======= HIGH-LEVEL HELPERS =======

  /**
   * สร้าง columns จาก config array
   */
  const createColumns = (
    configs: ColumnConfig<T>[],
    callbacks: ColumnCallbacks<T> = {}
  ): ComputedRef<ColumnDef<T, any>[]> => {
    console.log('🏗️ Creating columns from config', {
      count: configs.length,
      types: configs.map(c => c.type)
    })

    return computed(() =>
      configs.map((config, index) => {
        console.log(`  📦 Building column ${index + 1}/${configs.length}: type="${config.type}"`)
        
        switch (config.type) {
          case 'expand':
            return createExpandColumn(config)

          case 'id':
            return createIdColumn(
              config.key as keyof T,
              config.header,
              { ...config, onSort: callbacks.onSort }
            )

          case 'text':
            return createTextColumn(
              config.key as keyof T,
              config.header,
              { ...config, onSort: callbacks.onSort }
            )

          case 'date':
            return createDateColumn(
              config.key as keyof T,
              config.header,
              { ...config, onSort: callbacks.onSort }
            )

          case 'number':
            return createNumberColumn(
              config.key as keyof T,
              config.header,
              { ...config, onSort: callbacks.onSort }
            )

          case 'status':
            return createStatusColumn(
              config.key as keyof T,
              config.header,
              { ...config, onSort: callbacks.onSort }
            )

          case 'action':
            return createActionColumn<T>(
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
                  menuLabel: config.menuLabel,

                  onView: callbacks.onView,
                  onEdit: callbacks.onEdit,
                  onDelete: callbacks.onDelete,
                  onDownload: callbacks.onDownload,
                  onAction: callbacks.onCustomAction,
                }),
              config.header || '',
              { enableHiding: config.enableHiding ?? false }
            )

          default:
            throw new Error(`Unsupported column type: ${(config as any).type}`)
        }
      })
    )
  }

  /**
   * Quick helper สำหรับสร้าง CRUD columns
   */
  const createCrudColumns = (config: CrudColumnsConfig<T>): ColumnConfig<T>[] => {
    console.log('🚀 Creating CRUD columns', {
      fieldsCount: config.fields.length,
      enableExpand: config.enableExpand,
      enableId: config.enableId,
      enableActions: config.enableActions
    })

    const columnConfigs: ColumnConfig<T>[] = []

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
        enableHiding: true,
      })
    }

    // Field columns
    config.fields.forEach(field => {
      columnConfigs.push({
        type: (field.type || 'text') as any,
        key: field.key,
        header: field.header,
        sortable: true,
        enableHiding: true,
        ...field.options,
      })
    })

    // Action column
    if (config.enableActions) {
      columnConfigs.push({
        type: 'action',
        enableHiding: false,
        ...config.actionOptions,
      })
    }

    return columnConfigs
  }

  // ======= RETURN =======
  return {
    // Core creators
    createSortableHeader,
    createExpandColumn,
    createTextColumn,
    createDateColumn,
    createNumberColumn,
    createIdColumn,
    createStatusColumn,
    createActionColumn,

    // High-level helpers
    createColumns,
    createCrudColumns,
  }
}

// ======= EXPORTS =======
export type {
  // Options
  BaseColumnOptions,
  TextColumnOptions,
  DateColumnOptions,
  NumberColumnOptions,
  StatusColumnOptions,
  ActionColumnOptions,
  ExpandColumnOptions,
  
  // Configs
  ColumnConfig,
  ColumnCallbacks,
  CustomAction,
  StatusConfig,
  CrudColumnsConfig,
  
  // Return type
  ColumnBuilderReturn,
}
