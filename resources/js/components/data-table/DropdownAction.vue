<script setup lang="ts">
import { MoreHorizontal, Copy, Eye, Edit, Trash2, Expand } from 'lucide-vue-next'
import type { Payment } from '@/types/payment'
import { toast } from 'vue-sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '@/lib/utils'

// Props definition
interface Props {
  payment: Payment
}

const props = defineProps<Props>()

// Events
const emit = defineEmits<{
  expand: []
}>()

// Actions
const copyPaymentId = async () => {
  try {
    await copyToClipboard(props.payment.id)
    toast.success('คัดลอก Payment ID แล้ว')
  } catch (error) {
    toast.error('ไม่สามารถคัดลอกได้')
  }
}

const viewPayment = () => {
  toast.info('เปิดหน้าดูรายละเอียด')
  // TODO: เพิ่ม logic สำหรับการดูรายละเอียด
}

const editPayment = () => {
  toast.info('เปิดหน้าแก้ไข')
  // TODO: เพิ่ม logic สำหรับการแก้ไข
}

const deletePayment = () => {
  toast.warning('ยืนยันการลบ')
  // TODO: เพิ่ม logic สำหรับการลบ
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button 
        variant="ghost" 
        size="icon"
        class="h-8 w-8 p-0 hover:bg-muted"
      >
        <span class="sr-only">เปิดเมนู</span>
        <MoreHorizontal class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuLabel class="text-xs font-medium text-muted-foreground">
        การดำเนินการ
      </DropdownMenuLabel>
      
      <DropdownMenuItem @click="copyPaymentId" class="text-sm">
        <Copy class="mr-2 h-4 w-4" />
        คัดลอก Payment ID
      </DropdownMenuItem>
      
      <DropdownMenuItem @click="emit('expand')" class="text-sm">
        <Expand class="mr-2 h-4 w-4" />
        แสดงรายละเอียด
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem @click="viewPayment" class="text-sm">
        <Eye class="mr-2 h-4 w-4" />
        ดูรายละเอียด
      </DropdownMenuItem>
      
      <DropdownMenuItem @click="editPayment" class="text-sm">
        <Edit class="mr-2 h-4 w-4" />
        แก้ไข
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuItem 
        @click="deletePayment" 
        class="text-sm text-destructive focus:text-destructive"
      >
        <Trash2 class="mr-2 h-4 w-4" />
        ลบ
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
