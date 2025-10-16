<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Props สำหรับ HeaderWithTitle Component
 * Component นี้ทำหน้าที่แสดงหัวข้อหลัก พร้อม subtitle, description และ actions
 */
interface Props {
  /** หัวข้อหลัก */
  title?: string
  /** หัวข้อรอง */
  subtitle?: string
  /** คำอธิบาย */
  description?: string
  /** ข้อความ badge */
  badge?: string
  /** รูปแบบ badge */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  /** ขนาดของหัวข้อ */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** การจัดตำแหน่ง */
  align?: 'left' | 'center' | 'right'
  /** เปิดใช้งาน animation */
  animated?: boolean
  /** แสดง gradient background */
  withGradient?: boolean
  /** CSS class เพิ่มเติม */
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  description: '',
  badge: '',
  badgeVariant: 'secondary',
  size: 'lg',
  align: 'left',
  animated: true,
  withGradient: true,
  class: ''
})

// State สำหรับควบคุม animation visibility
const isVisible = ref<boolean>(false)

// คำนวณ CSS classes ต่างๆ โดยแยกเป็น computed properties แต่ละส่วน
const titleClasses = computed(() => {
  const sizeMap = {
    sm: 'text-lg sm:text-xl font-semibold',
    md: 'text-xl sm:text-2xl font-semibold',
    lg: 'text-2xl sm:text-3xl font-bold',
    xl: 'text-3xl sm:text-4xl font-bold'
  }
  
  const alignMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  return cn(
    sizeMap[props.size],
    alignMap[props.align],
    'leading-tight tracking-tight text-foreground',
    'bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text',
    props.animated && 'transition-all duration-500 ease-out transform',
    isVisible.value ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
  )
})

const subtitleClasses = computed(() => {
  const sizeMap = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }
  
  const alignMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  return cn(
    sizeMap[props.size],
    alignMap[props.align],
    'font-medium text-muted-foreground/80',
    props.animated && 'transition-all duration-700 ease-out transform delay-100',
    isVisible.value ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
  )
})

const descriptionClasses = computed(() => {
  const alignMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  return cn(
    'text-sm text-muted-foreground/70 leading-relaxed max-w-2xl',
    alignMap[props.align],
    props.animated && 'transition-all duration-900 ease-out transform delay-200',
    isVisible.value ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
  )
})

const containerClasses = computed(() => {
  const alignMap = {
    left: 'items-start',
    center: 'items-center',
    right: 'items-end'
  }
  
  return cn('flex flex-col gap-2', alignMap[props.align])
})

const wrapperClasses = computed(() => {
  return cn(
    'relative space-y-4 p-4 rounded-2xl',
    props.withGradient && 'bg-gradient-to-br from-background via-background to-muted/20',
    'border border-border/40 shadow-sm hover:shadow-md',
    'backdrop-blur-sm transition-all duration-300 ease-out',
    props.class
  )
})

const badgeClasses = computed(() => {
  return cn(
    'flex-shrink-0 shadow-sm transition-transform duration-200 ease-out hover:scale-105',
    props.animated && 'animate-in slide-in-from-right-2 duration-500 delay-300'
  )
})

const actionsClasses = computed(() => {
  return cn(
    'flex-shrink-0',
    props.animated && 'transition-all duration-500 ease-out transform delay-400',
    isVisible.value ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
  )
})

const contentClasses = computed(() => {
  return cn(
    props.animated && 'transition-all duration-1000 ease-out transform delay-500',
    isVisible.value ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
  )
})

const decorativeLineClasses = computed(() => {
  return cn(
    'absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full',
    props.animated && 'transition-all duration-700 ease-out transform delay-100',
    isVisible.value ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
  )
})

const backgroundClasses = computed(() => {
  return cn(
    'absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl',
    props.animated && 'transition-opacity duration-1000 ease-out',
    isVisible.value ? 'opacity-100' : 'opacity-0'
  )
})

// เริ่ม animation หลังจาก component mount
onMounted(() => {
  if (props.animated) {
    setTimeout(() => {
      isVisible.value = true
    }, 50)
  } else {
    isVisible.value = true
  }
})

// Log สำหรับการตรวจสอบ
console.log('HeaderWithTitle: Component initialized', {
  animated: props.animated,
  withGradient: props.withGradient,
  size: props.size,
  align: props.align
})
</script>

<template>
  <!-- Container หลักที่รวม Title และ Content -->
  <div :class="wrapperClasses">
    <!-- Background Decoration (ถ้าใช้ gradient) -->
    <div v-if="withGradient" :class="backgroundClasses" />
    
    <!-- Top decorative line -->
    <div v-if="withGradient" :class="decorativeLineClasses" />

    <!-- ส่วน Title และ Description -->
    <div :class="containerClasses" class="relative z-10">
      <!-- Main Title Section -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 w-full">
        <!-- Title และ Badge Group -->
        <div class="flex flex-col gap-2 min-w-0 flex-1">
          <!-- Title Row -->
          <div class="flex items-start gap-2 flex-wrap">
            <!-- หัวข้อหลัก -->
            <div class="min-w-0 flex-1">
              <h1 :class="titleClasses">
                <slot name="title">
                  {{ title }}
                </slot>
              </h1>
            </div>
            
            <!-- Badge -->
            <Badge 
              v-if="badge" 
              :variant="badgeVariant"
              :class="badgeClasses"
            >
              {{ badge }}
            </Badge>
          </div>
          
          <!-- หัวข้อรอง -->
          <p v-if="subtitle" :class="subtitleClasses">
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </p>
          
          <!-- คำอธิบาย -->
          <div v-if="description || $slots.description" :class="descriptionClasses">
            <slot name="description">
              {{ description }}
            </slot>
          </div>
        </div>
        
        <!-- Actions Section -->
        <div v-if="$slots.actions" :class="actionsClasses">
          <slot name="actions" />
        </div>
      </div>
      
      <!-- Slot สำหรับ Content เพิ่มเติม -->
      <div v-if="$slots.default" :class="contentClasses">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* การปรับแต่งสำหรับ Mobile Responsive */
@media (max-width: 640px) {
  .flex-col {
    gap: 1rem;
  }
  
  h1 {
    word-break: break-word;
    line-height: 1.1;
  }
}

/* Custom animations */
@keyframes slide-in-from-right-2 {
  from {
    transform: translateX(0.5rem);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes animate-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Gradient text support */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Enhanced focus states */
*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  border-radius: 4px;
}

/* Backdrop blur support */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}
</style>
