/**
 * ไฟล์: resources/js/lib/formatters/index.ts
 * คำอธิบาย: Central export point สำหรับ formatter functions ทั้งหมด
 * หน้าที่: จัดการ exports และ re-exports ของ formatters
 */

// Export ทั้งหมดจาก date formatter
export {
  formatDate,
  formatRelativeDate,
  toDateInputValue,
  calculateAge,
  isDateInPast,
  isDateInFuture,
  type DateFormatType,
  type DateFormatOptions
} from './date-formatter'

// Export ทั้งหมดจาก number formatter
export {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  formatCompactNumber,
  numberToThaiText,
  type NumberFormatOptions
} from './number-formatter'

// Export ทั้งหมดจาก text formatter
export {
  truncateText,
  toTitleCase,
  toSentenceCase,
  normalizeWhitespace,
  humanizeString,
  slugify,
  highlightText,
  sanitizeString,
  wordCount,
  characterCount
} from './text-formatter'

// Export ทั้งหมดจาก thai-id formatter (ถ้ามี)
export * from './thai-id-formatter'

// Export ทั้งหมดจาก validation formatter (ถ้ามี)
export * from './validation-formatter'
