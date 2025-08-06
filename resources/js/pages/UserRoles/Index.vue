<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { type BreadcrumbItem } from '@/types'
import { Head } from '@inertiajs/vue3'
import { ref, computed } from 'vue'
import { router, useForm } from '@inertiajs/vue3'
import { toast } from 'vue-sonner'
import { debounce } from 'lodash'

// Import Components
import Card from '@/components/ui/card/Card.vue'
import CardContent from '@/components/ui/card/CardContent.vue'
import CardHeader from '@/components/ui/card/CardHeader.vue'
import CardTitle from '@/components/ui/card/CardTitle.vue'
import Input from '@/components/ui/input/Input.vue'
import Button from '@/components/ui/button/Button.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Avatar from '@/components/ui/avatar/Avatar.vue'
import AvatarFallback from '@/components/ui/avatar/AvatarFallback.vue'

// Import Icons
import { 
  Search, 
  X, 
  Users, 
  Shield, 
  UserCheck, 
  Trash2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-vue-next'

// กำหนด breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
  },
  {
    title: 'จัดการ Role ผู้ใช้',
    href: '/user-roles',
  },
]

// Props interface
interface User {
  id: number
  name: string
  email: string
  department?: string
  position?: string
  roles: Array<{
    id: number
    name: string
  }>
}

interface Role {
  id: number
  name: string
}

interface Props {
  users: {
    data: User[]
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
    prev_page_url?: string
    next_page_url?: string
  }
  availableRoles: Role[]
  filters: {
    search?: string
  }
  currentUser: {
    id: number
    name: string
    roles: string[]
    is_super_admin: boolean
    is_admin: boolean
  }
}

const props = defineProps<Props>()

// State
const isUpdating = ref(false)

// ฟอร์มสำหรับค้นหา
const searchForm = useForm({
  search: props.filters.search || ''
})

// ฟังก์ชันค้นหาแบบ debounce (รอ 500ms หลังจากหยุดพิมพ์)
const handleSearch = debounce(() => {
  searchForm.get(route('user-roles.index'), {
    preserveState: true,
    replace: true,
    onSuccess: () => {
      toast.success('ค้นหาเสร็จสิ้น')
    }
  })
}, 500)

// ลบการค้นหา
const clearSearch = () => {
  searchForm.search = ''
  handleSearch()
}

// คำนวณหน้าสำหรับ pagination
const paginationPages = computed(() => {
  const pages: Array<number | string> = []
  const currentPage = props.users.current_page
  const lastPage = props.users.last_page
  
  // แสดงหน้าแรกถ้าห่างไกล
  if (currentPage > 3) pages.push(1)
  if (currentPage > 4) pages.push('...')
  
  // แสดงหน้าใกล้เคียงกับหน้าปัจจุบัน
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(lastPage, currentPage + 2); i++) {
    pages.push(i)
  }
  
  // แสดงหน้าสุดท้ายถ้าห่างไกล
  if (currentPage < lastPage - 3) pages.push('...')
  if (currentPage < lastPage - 2) pages.push(lastPage)
  
  return pages
})

// ไปยังหน้าที่ระบุ
const goToPage = (page: number | string) => {
  if (page === '...' || page === props.users.current_page) return
  
  router.get(route('user-roles.index'), {
    ...searchForm.data(),
    page: page
  }, {
    preserveState: true,
    replace: true
  })
}

// อัปเดต role ของผู้ใช้
const updateUserRole = async (user: User, newRole: string) => {
  if (isUpdating.value) return
  
  // ตรวจสอบว่าเป็นการเปลี่ยน role จริงๆ หรือไม่
  const currentRole = user.roles.length > 0 ? user.roles[0].name : ''
  if (currentRole === newRole) return
  
  isUpdating.value = true
  
  try {
    await router.patch(route('user-roles.update-role', user.id), {
      role: newRole || null
    }, {
      preserveState: false,
      onSuccess: (page: any) => {
        const message = page.props.flash?.success
        if (message) {
          toast.success(message)
        }
      },
      onError: (errors: any) => {
        console.error('เกิดข้อผิดพลาดในการอัปเดต role:', errors)
        
        if (errors.role) {
          toast.error(errors.role)
        } else if (typeof errors === 'string') {
          toast.error(errors)
        } else {
          toast.error('เกิดข้อผิดพลาดในการอัปเดต role กรุณาลองใหม่อีกครั้ง')
        }
      }
    })
  } finally {
    isUpdating.value = false
  }
}

// ยืนยันและลบ role ของผู้ใช้
const confirmRemoveRole = (user: User) => {
  if (isUpdating.value) return
  
  const roleName = user.roles.length > 0 ? getRoleDisplayName(user.roles[0].name) : 'role'
  
  if (!confirm(`คุณต้องการลบ ${roleName} ของ ${user.name} หรือไม่?\n\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
    return
  }
  
  removeUserRole(user)
}

// ลบ role ของผู้ใช้
const removeUserRole = async (user: User) => {
  isUpdating.value = true
  
  try {
    await router.delete(route('user-roles.remove-role', user.id), {
      preserveState: false,
      onSuccess: (page: any) => {
        const message = page.props.flash?.success
        if (message) {
          toast.success(message)
        }
      },
      onError: (errors: any) => {
        console.error('เกิดข้อผิดพลาดในการลบ role:', errors)
        
        if (typeof errors === 'string') {
          toast.error(errors)
        } else {
          toast.error('เกิดข้อผิดพลาดในการลบ role กรุณาลองใหม่อีกครั้ง')
        }
      }
    })
  } finally {
    isUpdating.value = false
  }
}

// ตรวจสอบว่าสามารถแก้ไข user คนนี้ได้หรือไม่
const canUpdateUser = (user: User): boolean => {
  // ไม่สามารถแก้ไขตัวเองได้
  if (user.id === props.currentUser.id) return false
  
  // ตรวจสอบจาก availableRoles ว่ามีสิทธิ์หรือไม่
  return props.availableRoles.length > 0
}

// ดึงอักษรย่อจากชื่อ
const getInitials = (name: string): string => {
  return name.split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// แปลงชื่อ role เป็นภาษาไทย
const getRoleDisplayName = (roleName: string): string => {
  const roleNames: Record<string, string> = {
    'super admin': 'ผู้ดูแลระบบสูงสุด',
    'admin': 'ผู้ดูแลระบบ',
    'member': 'ผู้ใช้งาน'
  }
  return roleNames[roleName] || roleName
}

// กำหนดสีสำหรับ role badge
const getRoleColor = (roleName: string): string => {
  const colors: Record<string, string> = {
    'super admin': 'bg-purple-100 text-purple-800 border-purple-200',
    'admin': 'bg-blue-100 text-blue-800 border-blue-200',
    'member': 'bg-green-100 text-green-800 border-green-200'
  }
  return colors[roleName] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// นับจำนวนผู้ใช้ตาม role
const getUsersByRole = (roleName: string): number => {
  return props.users.data.filter(user => 
    user.roles.some(role => role.name === roleName)
  ).length
}
</script>

<template>
  <Head title="จัดการ Role ผู้ใช้" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- สถิติสรุปด้านบน -->
      <div class="grid auto-rows-min gap-4 md:grid-cols-3">
        <!-- การ์ดแสดงจำนวนผู้ใช้ทั้งหมด -->
        <div class="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
          <Card class="h-full border-none shadow-none">
            <CardContent class="p-6">
              <div class="flex items-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="ml-4">
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ users.total }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">ผู้ใช้ทั้งหมด</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <!-- การ์ดแสดงจำนวน Super Admin -->
        <div class="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
          <Card class="h-full border-none shadow-none">
            <CardContent class="p-6">
              <div class="flex items-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <Shield class="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div class="ml-4">
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ getUsersByRole('super admin') }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">Super Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <!-- การ์ดแสดงจำนวน Admin -->
        <div class="relative overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
          <Card class="h-full border-none shadow-none">
            <CardContent class="p-6">
              <div class="flex items-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <UserCheck class="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div class="ml-4">
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ getUsersByRole('admin') }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-300">Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <!-- พื้นที่เนื้อหาหลัก -->
      <div class="relative min-h-[100vh] flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:min-h-min">
        <div class="h-full space-y-6 p-6">
          <!-- ส่วนค้นหา -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Search class="h-5 w-5" />
                ค้นหาผู้ใช้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex flex-col sm:flex-row gap-4">
                <div class="flex-1">
                  <Input 
                    v-model="searchForm.search"
                    placeholder="ค้นหาชื่อ, อีเมล, หน่วยงาน หรือตำแหน่ง..."
                    @input="handleSearch"
                    class="w-full"
                  />
                </div>
                <Button 
                  @click="clearSearch"
                  variant="outline"
                  v-if="searchForm.search"
                  class="shrink-0"
                >
                  <X class="h-4 w-4 mr-2" />
                  ล้างการค้นหา
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- ตารางแสดงรายชื่อผู้ใช้ -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Users class="h-5 w-5" />
                รายชื่อผู้ใช้
                <Badge variant="outline" class="ml-2">
                  {{ users.data.length }} / {{ users.total }}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent class="p-0">
              <div class="overflow-x-auto">
                <table class="w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ผู้ใช้
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                        หน่วยงาน
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role ปัจจุบัน
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        จัดการ
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="user in users.data" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <!-- คอลัมน์ข้อมูลผู้ใช้ -->
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <Avatar class="h-10 w-10 shrink-0">
                            <AvatarFallback>{{ getInitials(user.name) }}</AvatarFallback>
                          </Avatar>
                          <div class="ml-4 min-w-0 flex-1">
                            <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {{ user.name }}
                            </div>
                            <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {{ user.email }}
                            </div>
                            <!-- แสดงหน่วยงานใน mobile -->
                            <div class="text-xs text-gray-400 dark:text-gray-500 md:hidden mt-1">
                              {{ user.department || 'ไม่ระบุ' }}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <!-- คอลัมน์หน่วยงาน (ซ่อนใน mobile) -->
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden md:table-cell">
                        <div class="max-w-xs truncate">
                          {{ user.department || 'ไม่ระบุ' }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {{ user.position || 'ไม่ระบุตำแหน่ง' }}
                        </div>
                      </td>
                      
                      <!-- คอลัมน์ Role ปัจจุบัน -->
                      <td class="px-6 py-4 whitespace-nowrap">
                        <Badge v-if="user.roles.length > 0" 
                               :class="getRoleColor(user.roles[0].name)">
                          {{ getRoleDisplayName(user.roles[0].name) }}
                        </Badge>
                        <span v-else class="text-sm text-gray-400 dark:text-gray-500">ไม่มี role</span>
                      </td>
                      
                      <!-- คอลัมน์จัดการ -->
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex flex-col sm:flex-row gap-2">
                          <!-- Dropdown สำหรับเลือก Role -->
                          <select 
                            :value="user.roles.length > 0 ? user.roles[0].name : ''"
                            @change="updateUserRole(user, ($event.target as HTMLSelectElement).value)"
                            :disabled="isUpdating || !canUpdateUser(user)"
                            class="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                          >
                            <option value="">ไม่มี role</option>
                            <option 
                              v-for="role in availableRoles" 
                              :key="role.id" 
                              :value="role.name"
                            >
                              {{ getRoleDisplayName(role.name) }}
                            </option>
                          </select>

                          <!-- ปุ่มลบ Role -->
                          <Button
                            @click="confirmRemoveRole(user)"
                            variant="outline"
                            size="sm"
                            :disabled="isUpdating || !canUpdateUser(user) || user.roles.length === 0"
                            class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 shrink-0"
                          >
                            <Trash2 class="h-4 w-4" />
                            <span class="hidden sm:inline ml-1">ลบ</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- แสดงเมื่อไม่มีข้อมูล -->
              <div v-if="users.data.length === 0" class="text-center py-12">
                <Users class="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p class="text-gray-500 dark:text-gray-400">ไม่พบผู้ใช้ที่ตรงกับการค้นหา</p>
              </div>
            </CardContent>
          </Card>

          <!-- Pagination -->
          <Card v-if="users.last_page > 1">
            <CardContent class="flex items-center justify-between p-6">
              <div class="text-sm text-gray-700 dark:text-gray-300">
                แสดง {{ users.from || 0 }} ถึง {{ users.to || 0 }} จากทั้งหมด {{ users.total }} รายการ
              </div>
              <div class="flex space-x-1">
                <!-- Previous Page -->
                <Button
                  v-if="users.prev_page_url"
                  @click="goToPage(users.current_page - 1)"
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft class="h-4 w-4" />
                </Button>
                
                <!-- Page Numbers -->
                <Button
                  v-for="page in paginationPages"
                  :key="page"
                  @click="goToPage(page)"
                  :variant="page === users.current_page ? 'default' : 'outline'"
                  size="sm"
                  :disabled="page === '...'"
                >
                  {{ page }}
                </Button>
                
                <!-- Next Page -->
                <Button
                  v-if="users.next_page_url"
                  @click="goToPage(users.current_page + 1)"
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight class="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
