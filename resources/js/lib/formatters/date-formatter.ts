/**
 * ไฟล์: resources/js/lib/formatters/date-formatter.ts
 * คำอธิบาย: ฟังก์ชันสำหรับจัดรูปแบบวันที่และเวลา
 */

export type DateFormatType = "short" | "medium" | "long" | "full" | "time" | "datetime" | "relative";

export interface DateFormatOptions {
  locale?: string;
  timezone?: string;
  includeTime?: boolean;
  format?: DateFormatType;
}

/**
 * ฟังก์ชันจัดรูปแบบวันที่
 * @param date - วันที่ที่ต้องการจัดรูปแบบ
 * @param format - รูปแบบที่ต้องการ (short, medium, long, full, time, datetime, relative)
 * @param options - ตัวเลือกเพิ่มเติม
 * @returns สตริงวันที่ที่จัดรูปแบบแล้ว
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: DateFormatType = "short",
  options?: Partial<DateFormatOptions>
): string {
  if (!date) return "-";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date:", date);
      return "-";
    }

    const locale = options?.locale || "th-TH";

    switch (format) {
      case "short":
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(dateObj);
      case "medium":
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(dateObj);
      case "long":
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(dateObj);
      case "full":
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(dateObj);
      case "time":
        return new Intl.DateTimeFormat(locale, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(dateObj);
      case "datetime":
        return new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(dateObj);
      case "relative":
        return formatRelativeDate(dateObj, locale);
      default:
        return dateObj.toLocaleDateString(locale);
    }
  } catch (error) {
    console.error("Date formatting error:", error);
    return "-";
  }
}

/**
 * ฟังก์ชันจัดรูปแบบวันที่และเวลา
 * @param date - วันที่ที่ต้องการจัดรูปแบบ
 * @param options - ตัวเลือกเพิ่มเติม
 * @returns สตริงวันที่และเวลาที่จัดรูปแบบแล้ว
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  options?: Partial<DateFormatOptions>
): string {
  return formatDate(date, "datetime", options);
}

/**
 * ฟังก์ชันจัดรูปแบบวันที่แบบสัมพัทธ์ (เช่น "2 วันที่แล้ว")
 * @param date - วันที่ที่ต้องการจัดรูปแบบ
 * @param locale - ภาษาที่ต้องการแสดงผล
 * @returns สตริงวันที่แบบสัมพัทธ์
 */
export function formatRelativeDate(date: Date, locale: string = "th-TH"): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second");
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), "year");
  }
}

/**
 * แปลงวันที่เป็นรูปแบบ input[type="date"]
 * @param date - วันที่ที่ต้องการแปลง
 * @returns สตริงวันที่รูปแบบ YYYY-MM-DD
 */
export function toDateInputValue(date: Date | string | null): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "";
  return dateObj.toISOString().split("T")[0];
}

/**
 * คำนวณอายุจากวันเกิด
 * @param birthDate - วันเกิด
 * @returns อายุเป็นจำนวนปี
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * ตรวจสอบว่าวันที่อยู่ในอดีตหรือไม่
 * @param date - วันที่ที่ต้องการตรวจสอบ
 * @returns true ถ้าวันที่อยู่ในอดีต
 */
export function isDateInPast(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj < new Date();
}

/**
 * ตรวจสอบว่าวันที่อยู่ในอนาคตหรือไม่
 * @param date - วันที่ที่ต้องการตรวจสอบ
 * @returns true ถ้าวันที่อยู่ในอนาคต
 */
export function isDateInFuture(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * ตรวจสอบว่าวันที่เป็นวันที่ในอดีตหรือไม่ (สำหรับ validation)
 * @param date - วันที่ที่ต้องการตรวจสอบ
 * @returns true ถ้าวันที่อยู่ในอดีต
 */
export function isPastDate(date: string | Date): boolean {
  return isDateInPast(date);
}
