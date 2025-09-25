// resources/js/composables/useServerPagination.ts
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'

type Opts = {
  routeName: string
  currentPage: number
  totalPages: number
  perPage: number
  extra?: Record<string, any> // คง query อื่น ๆ เช่น ค้นหา/กรอง ในอนาคต
  replace?: boolean
}

export function useServerPagination(opts: Opts) {
  const canPrev = computed(() => opts.currentPage > 1)
  const canNext = computed(() => opts.currentPage < opts.totalPages)

  function goPage(page: number) {
    router.get(
      route(opts.routeName),
      { ...(opts.extra || {}), page, per_page: opts.perPage },
      { preserveScroll: true, preserveState: true, replace: opts.replace ?? true }
    )
  }

  function changePageSize(size: number) {
    router.get(
      route(opts.routeName),
      { ...(opts.extra || {}), page: 1, per_page: size },
      { preserveScroll: true, preserveState: true, replace: opts.replace ?? true }
    )
  }

  function goFirst() { if (opts.currentPage > 1) goPage(1) }
  function goPrev() { if (canPrev.value) goPage(opts.currentPage - 1) }
  function goNext() { if (canNext.value) goPage(opts.currentPage + 1) }
  function goLast() { if (opts.currentPage < opts.totalPages) goPage(opts.totalPages) }

  return {
    canPrev,
    canNext,
    goPage,
    changePageSize,
    goFirst,
    goPrev,
    goNext,
    goLast,
  }
}
