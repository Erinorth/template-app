import { ref, isRef } from 'vue'
import { router } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'

// comment: ฟังก์ชัน util ที่ตรวจว่าเป็น ref หรือค่า primitive
function get(v: any) {
  return isRef(v) ? v.value : v
}

// comment: composable สำหรับ trigger sort แบบ server-side
export function useServerSort({
  routeName,
  sort,
  direction,
  currentPage,
  perPage,
}: {
  routeName: string
  sort: string | Ref<string>
  direction: string | Ref<string>
  currentPage: number | Ref<number>
  perPage: number | Ref<number>
}) {
  const loading = ref(false)

  // comment: trigger กด sort ของ column
  const onSort = (col: string) => {
    let nextDirection = 'asc'
    if (get(sort) === col && get(direction) === 'asc') nextDirection = 'desc'

    toast.info(`เรียงข้อมูลโดย ${col} (${nextDirection})`)
    loading.value = true

    router.get(
      route(routeName),
      { sort: col, direction: nextDirection, per_page: get(perPage), page: 1 },
      {
        preserveState: true,
        preserveScroll: true,
        onFinish: () => (loading.value = false),
      }
    )
  }
  return { onSort, loading }
}
