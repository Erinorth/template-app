// --- ไฟล์: resources/js/composables/useDebounce.ts ---
import { ref, watch } from 'vue'

/**
 * ใช้สำหรับ debounce ค่า งาน event ต่าง ๆ เช่น search, typing ฯลฯ
 * @param value - ค่า ref ที่ต้องการ debounce
 * @param delay - ระยะเวลา ms (เช่น 400)
 */
export function useDebounce<T>(value: T, delay = 400) {
  const debounced = ref(value)

  let timeout: ReturnType<typeof setTimeout>

  watch(
    () => value,
    (val) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        debounced.value = val
      }, delay)
    },
    { immediate: true }
  )

  return debounced
}

// -- คอมเมนต์ไทย: ใช้สำหรับหน่วงเวลาการ search (debounce) เพื่อไม่ให้ server ทำงานทุก keystroke --
