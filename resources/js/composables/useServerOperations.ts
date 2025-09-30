import { ref, computed, isRef, type Ref } from 'vue'
import { router } from '@inertiajs/vue3'
import { useToast } from './useToast'
import { useErrorHandler } from './useErrorHandler'
import type { ServerOperationConfig } from '@/types/table'

/**
 * Universal composable สำหรับจัดการการดำเนินการ server-side
 * รวม pagination, sorting, และการจัดการ state ต่างๆ
 */
export function useServerOperations(config: ServerOperationConfig) {
  const { sortToast, paginationToast } = useToast()
  const { safeExecute, isLoading } = useErrorHandler()
  
  // ฟังก์ชันช่วยสำหรับดึงค่าจาก ref หรือ value
  const getValue = <T>(source: T | Ref<T>): T => {
    return isRef(source) ? source.value : source
  }

  // สถานะสำหรับ pagination
  const canPrev = computed(() => getValue(config.currentPage) > 1)
  const canNext = computed(() => {
    const total = getValue(config.totalPages)
    return total ? getValue(config.currentPage) < total : false
  })

  /**
   * ส่ง request ไปยัง server
   */
  const makeRequest = async (params: Record<string, any>) => {
    return safeExecute(async () => {
      router.get(
        route(config.routeName),
        { ...getValue(config.extra), ...params },
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
      per_page: getValue(config.perPage)
    })
    
    if (success && config.totalPages) {
      paginationToast.changed(page, getValue(config.totalPages))
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
      goPage(getValue(config.currentPage) - 1)
    }
  }

  const goNext = () => {
    if (canNext.value) {
      goPage(getValue(config.currentPage) + 1)
    }
  }

  const goLast = () => {
    if (canNext.value && config.totalPages) {
      goPage(getValue(config.totalPages))
    }
  }

  // Sorting functions
  const onSort = async (column: string) => {
    const currentSort = getValue(config.sort)
    const currentDirection = getValue(config.direction) || 'asc'
    
    let nextDirection: 'asc' | 'desc' = 'asc'
    if (currentSort === column && currentDirection === 'asc') {
      nextDirection = 'desc'
    }

    const success = await makeRequest({
      sort: column,
      direction: nextDirection,
      per_page: getValue(config.perPage),
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
