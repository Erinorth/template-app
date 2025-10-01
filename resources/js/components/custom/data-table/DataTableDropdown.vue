<script setup lang="ts" generic="T extends Record<string, any>">
import { MoreHorizontal, Copy, Eye, Edit, Trash2, Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { computed } from 'vue'

// Interface สำหรับ action items
interface ActionItem {
  key: string
  label: string
  icon?: any
  variant?: 'default' | 'destructive' | 'ghost'
  className?: string
  disabled?: boolean
  visible?: boolean
  separator?: boolean
}

// Props definition
interface Props {
  /** ข้อมูล record ที่จะใช้ในการทำงาน */
  item: T
  /** คอลัมน์ที่จะใช้เป็น ID หลัก (เช่น 'id', 'uuid') */
  idKey?: string
  /** คอลัมน์ที่จะใช้แสดงชื่อ (เช่น 'name', 'title') */
  nameKey?: string
  /** รายการ actions ที่จะแสดง */
  actions?: ActionItem[]
  /** เปิดใช้งาน copy ID */
  enableCopy?: boolean
  /** เปิดใช้งาน view action */
  enableView?: boolean
  /** เปิดใช้งาน edit action */
  enableEdit?: boolean
  /** เปิดใช้งาน delete action */
  enableDelete?: boolean
  /** เปิดใช้งาน download action */
  enableDownload?: boolean
  /** ข้อความ label หลัก */
  menuLabel?: string
  /** คลาสเพิ่มเติมสำหรับ trigger button */
  triggerClass?: string
  /** คลาสเพิ่มเติมสำหรับ dropdown content */
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  idKey: 'id',
  nameKey: 'name',
  actions: () => [],
  enableCopy: true,
  enableView: true,
  enableEdit: true,
  enableDelete: false,
  enableDownload: false,
  menuLabel: 'Actions',
  triggerClass: '',
  contentClass: ''
})

// Events definition
const emit = defineEmits<{
  /** เหตุการณ์เมื่อคลิก view */
  view: [item: T]
  /** เหตุการณ์เมื่อคลิก edit */
  edit: [item: T]
  /** เหตุการณ์เมื่อคลิก delete */
  delete: [item: T]
  /** เหตุการณ์เมื่อคลิก download */
  download: [item: T]
  /** เหตุการณ์สำหรับ custom actions */
  action: [actionKey: string, item: T]
}>()

// Computed สำหรับ ID และ Name - แก้ไข TypeScript error
const itemId = computed(() => {
  const id = (props.item as any)[props.idKey]
  return String(id || '')
})

const itemName = computed(() => {
  const name = (props.item as any)[props.nameKey]
  return String(name || '')
})

// ฟังก์ชัน copy ID ไปยัง clipboard
async function copyId() {
  try {
    await navigator.clipboard.writeText(itemId.value)
    toast.success(`ID คัดลอกแล้ว: ${itemId.value}`)
    console.log('Copy ID success:', itemId.value)
  } catch (error) {
    console.error('Copy failed:', error)
    toast.error('ไม่สามารถคัดลอก ID ได้')
  }
}

// ฟังก์ชัน handle actions
function handleView() {
  console.log('View item:', props.item)
  emit('view', props.item)
}

function handleEdit() {
  console.log('Edit item:', props.item)
  emit('edit', props.item)
}

function handleDelete() {
  console.log('Delete item:', props.item)
  emit('delete', props.item)
}

function handleDownload() {
  console.log('Download item:', props.item)
  emit('download', props.item)
}

function handleCustomAction(actionKey: string) {
  console.log('Custom action:', actionKey, props.item)
  emit('action', actionKey, props.item)
}

// Computed สำหรับ filtered actions
const visibleActions = computed(() => {
  return props.actions.filter(action => action.visible !== false)
})

// ตรวจสอบว่ามี actions อะไรเปิดใช้งานบ้าง
const hasAnyActions = computed(() => {
  return props.enableCopy || 
         props.enableView || 
         props.enableEdit || 
         props.enableDelete || 
         props.enableDownload || 
         visibleActions.value.length > 0
})
</script>

<template>
  <DropdownMenu v-if="hasAnyActions">
    <!-- Trigger Button -->
    <DropdownMenuTrigger as-child>
      <Button 
        variant="ghost" 
        :class="`w-8 h-8 p-0 hover:bg-muted ${triggerClass}`"
        :title="`เปิดเมนู ${itemName || itemId}`"
      >
        <span class="sr-only">เปิดเมนู {{ itemName || itemId }}</span>
        <MoreHorizontal class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>

    <!-- Dropdown Content -->
    <DropdownMenuContent 
      align="end" 
      :class="`min-w-[160px] ${contentClass}`"
    >
      <!-- Menu Label -->
      <DropdownMenuLabel class="text-xs sm:text-sm">
        {{ menuLabel }}
      </DropdownMenuLabel>

      <!-- Copy ID Action -->
      <template v-if="enableCopy && itemId">
        <DropdownMenuItem 
          @click="copyId"
          class="text-xs sm:text-sm cursor-pointer hover:bg-muted"
        >
          <Copy class="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          คัดลอก ID
        </DropdownMenuItem>
      </template>

      <!-- Separator หลังจาก Copy -->
      <DropdownMenuSeparator v-if="enableCopy && (enableView || enableEdit || enableDownload || enableDelete || visibleActions.length > 0)" />

      <!-- View Action -->
      <template v-if="enableView">
        <DropdownMenuItem 
          @click="handleView"
          class="text-xs sm:text-sm cursor-pointer hover:bg-muted"
        >
          <Eye class="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          ดูรายละเอียด
        </DropdownMenuItem>
      </template>

      <!-- Edit Action -->
      <template v-if="enableEdit">
        <DropdownMenuItem 
          @click="handleEdit"
          class="text-xs sm:text-sm cursor-pointer hover:bg-muted"
        >
          <Edit class="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          แก้ไข
        </DropdownMenuItem>
      </template>

      <!-- Download Action -->
      <template v-if="enableDownload">
        <DropdownMenuItem 
          @click="handleDownload"
          class="text-xs sm:text-sm cursor-pointer hover:bg-muted"
        >
          <Download class="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          ดาวน์โหลด
        </DropdownMenuItem>
      </template>

      <!-- Custom Actions -->
      <template v-for="(action, index) in visibleActions" :key="action.key">
        <!-- Separator ก่อน action ถ้าต้องการ -->
        <DropdownMenuSeparator v-if="action.separator" />
        
        <DropdownMenuItem 
          @click="handleCustomAction(action.key)"
          :disabled="action.disabled"
          :class="`
            text-xs sm:text-sm cursor-pointer hover:bg-muted
            ${action.variant === 'destructive' ? 'text-destructive hover:text-destructive' : ''}
            ${action.className || ''}
            ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `"
        >
          <component 
            v-if="action.icon" 
            :is="action.icon" 
            class="w-3 h-3 sm:w-4 sm:h-4 mr-2" 
          />
          {{ action.label }}
        </DropdownMenuItem>
      </template>

      <!-- Separator และ Delete Action -->
      <template v-if="enableDelete">
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          @click="handleDelete"
          class="text-xs sm:text-sm cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 class="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          ลบ
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
