import { shallowRef, watch, type Ref } from 'vue'

/**
 * ใช้สำหรับ debounce ค่าของ ref
 * @param source - ref ที่ต้องการ debounce
 * @param delay - ระยะเวลา ms (เช่น 400)
 */
export function useDebounce<T>(source: Ref<T>, delay = 400): Ref<T> {
  // ✅ ใช้ shallowRef เพื่อหลีกเลี่ยง UnwrapRef complexity
  const debounced = shallowRef<T>(source.value)
  
  // ✅ ใช้ ReturnType เพื่อให้ TypeScript infer type ที่ถูกต้อง
  let timeout: ReturnType<typeof setTimeout> | undefined

  watch(
    source,
    (newVal: T) => {
      if (timeout !== undefined) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        debounced.value = newVal
      }, delay)
    },
    { immediate: false }
  )

  return debounced
}

// คอมเมนต์: ใช้ shallowRef เพื่อหลีกเลี่ยง deep reactivity และ type issues
