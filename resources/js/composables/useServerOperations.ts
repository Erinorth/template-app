// ไฟล์: resources/js/composables/useServerOperations.ts

import { router } from '@inertiajs/vue3'
import { ref, computed, unref, type MaybeRefOrGetter } from 'vue'
import { useToast } from './useToast'
import type { ServerOperationConfig } from '@/types/table'

/**
 * ฟังก์ชันแปลง MaybeRefOrGetter เป็นค่าจริง
 */
function resolveUnref<T>(value: MaybeRefOrGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : unref(value)
}

export function useServerOperations(config: ServerOperationConfig) {
  console.log('useServerOperations: Initializing...', {
    routeName: config.routeName,
    currentPage: resolveUnref(config.currentPage),
    perPage: resolveUnref(config.perPage),
  })

  // Toast notifications
  const { sortToast, paginationToast } = useToast()

  // Loading state
  const isLoading = ref(false)

  // Computed helpers สำหรับ pagination
  const canPrev = computed(() => resolveUnref(config.currentPage) > 1)
  const canNext = computed(() => {
    if (!config.totalPages) return true
    return resolveUnref(config.currentPage) < resolveUnref(config.totalPages)
  })

  /**
   * ฟังก์ชันหลักในการส่ง request ไปยัง server
   * @param params - query parameters
   */
  const makeRequest = async (params: Record<string, any> = {}) => {
    try {
      isLoading.value = true
      
      // รวม parameters เพิ่มเติมจาก config
      const extraParams = config.extra ? resolveUnref(config.extra) : {}
      
      // สร้าง query parameters โดยใช้ per_page แทน perpage
      const queryParams = {
        ...extraParams,
        ...params,
        // แปลง perpage เป็น per_page สำหรับ Laravel
        ...(params.perpage && { per_page: params.perpage }),
      }
      
      // ลบ perpage ออกเพราะใช้ per_page แทน
      delete queryParams.perpage

      console.log('useServerOperations: Making request', {
        route: config.routeName,
        queryParams,
      })

      // ส่ง request ด้วย Inertia
      router.get(
        route(config.routeName),
        queryParams,
        {
          preserveState: true,
          preserveScroll: true,
          replace: config.replace ?? false,
          onSuccess: () => {
            console.log('useServerOperations: Request successful')
          },
          onError: (errors) => {
            console.error('useServerOperations: Request failed', errors)
          },
          onFinish: () => {
            isLoading.value = false
          },
        }
      )

      return true
    } catch (error) {
      console.error('useServerOperations: Request error', error)
      isLoading.value = false
      return false
    }
  }

  /**
   * ไปยังหน้าที่ระบุ
   */
  const goPage = async (page: number) => {
    console.log('useServerOperations: Go to page', page)
    const success = await makeRequest({
      page,
      per_page: resolveUnref(config.perPage), // ใช้ per_page แทน perpage
    })

    if (success && config.totalPages) {
      paginationToast.changed(page, resolveUnref(config.totalPages))
    }
  }

  /**
   * เปลี่ยน page size
   */
  const changePageSize = async (size: number) => {
    console.log('useServerOperations: Change page size to', size)
    const success = await makeRequest({
      page: 1, // รีเซ็ตกลับไปหน้า 1 เมื่อเปลี่ยน page size
      per_page: size, // ใช้ per_page แทน perpage
    })

    if (success) {
      paginationToast.sizeChanged(size)
    }
  }

  /**
   * ไปหน้าแรก
   */
  const goFirst = () => {
    if (canPrev.value) {
      goPage(1)
    }
  }

  /**
   * ไปหน้าก่อนหน้า
   */
  const goPrev = () => {
    if (canPrev.value) {
      goPage(resolveUnref(config.currentPage) - 1)
    }
  }

  /**
   * ไปหน้าถัดไป
   */
  const goNext = () => {
    if (canNext.value) {
      goPage(resolveUnref(config.currentPage) + 1)
    }
  }

  /**
   * ไปหน้าสุดท้าย
   */
  const goLast = () => {
    if (canNext.value && config.totalPages) {
      goPage(resolveUnref(config.totalPages))
    }
  }

  /**
   * เรียงลำดับข้อมูล
   */
  const onSort = async (column: string) => {
    const currentSort = config.sort ? resolveUnref(config.sort) : ''
    const currentDirection = config.direction ? resolveUnref(config.direction) : 'asc'

    // สลับทิศทาง: asc <-> desc
    let nextDirection: 'asc' | 'desc' = 'asc'
    if (currentSort === column) {
      nextDirection = currentDirection === 'asc' ? 'desc' : 'asc'
    }

    console.log('useServerOperations: Sort', column, 'direction', nextDirection)

    const success = await makeRequest({
      sort: column,
      direction: nextDirection,
      per_page: resolveUnref(config.perPage), // ใช้ per_page แทน perpage
      page: 1, // รีเซ็ตกลับไปหน้า 1 เมื่อเรียงใหม่
    })

    if (success) {
      sortToast.success(column, nextDirection)
    }
  }

  return {
    isLoading,
    canPrev,
    canNext,
    goPage,
    changePageSize,
    goFirst,
    goPrev,
    goNext,
    goLast,
    onSort,
    makeRequest,
  }
}
