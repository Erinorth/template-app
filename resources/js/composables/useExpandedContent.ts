// Generic interface สำหรับการกำหนดค่าการแสดงผลแบบขยาย
export interface ExpandedContentConfig<T> {
  // กำหนด field ที่ต้องการแสดงพร้อม label
  fields: Array<{
    key: keyof T
    label: string
    formatter?: (value: any) => string
  }>
  // Custom content builder
  customBuilder?: (item: T) => string
  // การจัดรูปแบบ default
  defaultFormatter?: (value: any) => string
}

// Generic composable สำหรับสร้าง expanded content
export function useExpandedContent<T>(config: ExpandedContentConfig<T>) {
  // Default formatter สำหรับแปลงค่าต่างๆ
  const formatValue = (value: any, formatter?: (value: any) => string): string => {
    if (formatter) {
      return formatter(value)
    }
    
    if (config.defaultFormatter) {
      return config.defaultFormatter(value)
    }
    
    // Default formatting
    if (value === null || value === undefined) {
      return 'ไม่มีข้อมูล'
    }
    
    if (typeof value === 'string' && value.trim() === '') {
      return 'ไม่มี'
    }
    
    return String(value)
  }

  // สร้าง expanded content
  const createExpandedContent = (item: T): string => {
    // ถ้ามี custom builder ให้ใช้แทน
    if (config.customBuilder) {
      return config.customBuilder(item)
    }
    
    // สร้าง content จาก fields ที่กำหนด
    return config.fields
      .map(field => {
        const value = item[field.key]
        const formattedValue = formatValue(value, field.formatter)
        return `${field.label}: ${formattedValue}`
      })
      .join('\n')
  }

  return {
    createExpandedContent,
    formatValue
  }
}
