import { ref, computed, isRef, unref, type Ref } from 'vue'
import { router } from '@inertiajs/vue3'
import { useToast } from './useToast'
import { useErrorHandler } from './useErrorHandler'
import type { ServerOperationConfig, MaybeRefOrGetter } from '@/types/table'

/**
 * Helper function เพื่อดึงค่าจาก reactive values
 * รองรับ ref, computed, getter functions, และ plain values
 */
function resolveUnref<T>(r: MaybeRefOrGetter<T>): T {
  return typeof r === 'function'
    ? (r as any)()
    : unref(r)
}

/**
 * Universal composable สำหรับจัดการการดำเนินการ server-side
 * รวม pagination, sorting, และการจัดการ state ต่างๆ
 * รองรับทั้ง static values และ reactive values
 */
export function useServerOperations(config: ServerOperationConfig) {
  const { sortToast, paginationToast } = useToast()
  const { safeExecute, isLoading } = useErrorHandler()

  // สถานะสำหรับ pagination - ใช้ computed เพื่อ reactive
  const canPrev = computed(() => resolveUnref(config.currentPage) > 1)
  const canNext = computed(() => {
    const totalPages = config.totalPages ? resolveUnref(config.totalPages) : 0
    return totalPages > 0 && resolveUnref(config.currentPage) < totalPages
  })

  /**
   * ส่ง request ไปยัง server
   */
  const makeRequest = async (additionalParams: Record<string, any> = {}) => {
    return safeExecute(async () => {
      const extraParams = config.extra ? resolveUnref(config.extra) : {}
      
      router.get(
        route(config.routeName),
        { 
          ...extraParams,
          ...additionalParams 
        },
        { 
          preserveScroll: true, 
          preserveState: true, 
          replace: config.replace ?? true 
        }
      )
    })
  }

  // Pagination functions
  const goPage = async (page: number) => {
    const success = await makeRequest({
      page,
      per_page: resolveUnref(config.perPage)
    })
    
    if (success && config.totalPages) {
      paginationToast.changed(page, resolveUnref(config.totalPages))
    }
  }

  const changePageSize = async (size: number) => {
    const success = await makeRequest({
      page: 1,
      per_page: size
    })
    
    if (success) {
      paginationToast.sizeChanged(size)
    }
  }

  const goFirst = () => {
    if (canPrev.value) goPage(1)
  }

  const goPrev = () => {
    if (canPrev.value) {
      goPage(resolveUnref(config.currentPage) - 1)
    }
  }

  const goNext = () => {
    if (canNext.value) {
      goPage(resolveUnref(config.currentPage) + 1)
    }
  }

  const goLast = () => {
    if (canNext.value && config.totalPages) {
      goPage(resolveUnref(config.totalPages))
    }
  }

  // Sorting functions
  const onSort = async (column: string) => {
    const currentSort = config.sort ? resolveUnref(config.sort) : ''
    const currentDirection = config.direction ? resolveUnref(config.direction) : 'asc'
    
    let nextDirection: 'asc' | 'desc' = 'asc'
    if (currentSort === column && currentDirection === 'asc') {
      nextDirection = 'desc'
    }

    const success = await makeRequest({
      sort: column,
      direction: nextDirection,
      per_page: resolveUnref(config.perPage),
      page: 1
    })

    if (success) {
      sortToast.success(column, nextDirection)
    }
  }

  return {
    // States
    isLoading,
    canPrev,
    canNext,
    
    // Pagination
    goPage,
    changePageSize,
    goFirst,
    goPrev,
    goNext,
    goLast,
    
    // Sorting
    onSort,
    
    // Generic request function
    makeRequest
  }
}
