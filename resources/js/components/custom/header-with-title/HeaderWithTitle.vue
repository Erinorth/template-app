<!--
  ไฟล์: resources/js/components/custom/HeaderWithTitle.vue
  คำอธิบาย: Component สำหรับแสดงหัวข้อแบบสวยงาม (แยก AddDataButton ออกแล้ว)
  ฟีเจอร์หลัก:
  - แสดงหัวข้อแบบสวยงามพร้อม Badge และ Description
  - รองรับ Responsive Design สำหรับทุกขนาดหน้าจอ
  - เป็น Generic Component ที่ใช้ร่วมกันได้
  - Animation และ Transitions ที่นุ่มนวล
  - Modern Design System
-->

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed, ref, onMounted } from 'vue'
import { cn } from '@/lib/utils'

// UI Components
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Interface สำหรับ Props
interface Props {
  title: string
  subtitle?: string
  description?: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  align?: 'left' | 'center' | 'right'
  class?: HTMLAttributes['class']
  showSeparator?: boolean
  animated?: boolean
  withGradient?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  align: 'left',
  badgeVariant: 'secondary',
  showSeparator: true,
  animated: true,
  withGradient: false
})

// State สำหรับ animation
const isVisible = ref(false)

// คำนวณ class สำหรับขนาดหัวข้อ
const titleClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-lg sm:text-xl font-semibold',
    md: 'text-xl sm:text-2xl font-semibold',
    lg: 'text-2xl sm:text-3xl font-bold',
    xl: 'text-3xl sm:text-4xl font-bold'
  }
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  return cn(
    sizeClasses[props.size],
    alignClasses[props.align],
    'leading-tight tracking-tight text-foreground',
    'bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text',
    props.animated && 'transition-all duration-500 ease-out transform',
    isVisible.value ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
  )
})

// คำนวณ class สำหรับหัวข้อรอง
const subtitleClasses = computed(() => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  return cn(
    sizeClasses[props.size],
    alignClasses[props.align],
    'font-medium text-muted-foreground/80',
    props.animated && 'transition-all duration-700 ease-out transform delay-100',
    isVisible.value ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
  )
})

// คำนวณ class สำหรับคำอธิบาย
const descriptionClasses = computed(() => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }
  
  return cn(
    'text-sm text-muted-foreground/70 leading-relaxed max-w-2xl',
    alignClasses[props.align],
    props.animated && 'transition-all duration-900 ease-out transform delay-200',
    isVisible.value ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
  )
})

// คำนวณ class สำหรับ container หลัก
const containerClasses = computed(() => {
  const alignClasses = {
    left: 'items-start',
    center: 'items-center',
    right: 'items-end'
  }
  
  return cn(
    'flex flex-col gap-2', // เปลี่ยนจาก gap-3
    alignClasses[props.align]
  )
})


// คำนวณ class สำหรับ main wrapper
const wrapperClasses = computed(() => {
  return cn(
    'relative space-y-4 p-4 rounded-2xl',
    props.withGradient && 'bg-gradient-to-br from-background via-background to-muted/20',
    'border border-border/40 shadow-sm hover:shadow-md',
    'backdrop-blur-sm transition-all duration-300 ease-out',
    props.class
  )
})


// คำนวณ class สำหรับ badge
const badgeClasses = computed(() => {
  return cn(
    'flex-shrink-0 shadow-sm transition-transform duration-200 ease-out hover:scale-105',
    props.animated && 'animate-in slide-in-from-right-2 duration-500 delay-300'
  )
})

// คำนวณ class สำหรับ actions
const actionsClasses = computed(() => {
  return cn(
    'flex-shrink-0',
    props.animated && 'transition-all duration-500 ease-out transform delay-400',
    isVisible.value ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
  )
})

// Animation lifecycle
onMounted(() => {
  if (props.animated) {
    // เริ่ม animation หลังจาก mount
    setTimeout(() => {
      isVisible.value = true
    }, 50)
  } else {
    isVisible.value = true
  }
})

// Log สำหรับการตรวจสอบ
console.log('HeaderWithTitle: Component initialized with enhanced UI', {
  animated: props.animated,
  withGradient: props.withGradient,
  size: props.size
})
</script>

<template>
  <!-- Container หลักที่รวม Title และ Content -->
  <div :class="wrapperClasses">
    <!-- Background Decoration (ถ้าใช้ gradient) -->
    <div 
      v-if="withGradient"
      class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl"
      :class="[
        animated && 'transition-opacity duration-1000 ease-out',
        isVisible ? 'opacity-100' : 'opacity-0'
      ]"
    />
    
    <!-- Top decorative line -->
    <div 
      v-if="withGradient"
      class="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full"
      :class="[
        animated && 'transition-all duration-700 ease-out transform delay-100',
        isVisible ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
      ]"
    />

    <!-- ส่วน Title และ Description -->
<div :class="containerClasses" class="relative z-10">
  <!-- Main Title Section -->
  <div :class="cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 w-full')">
    <!-- Title และ Badge Group -->
    <div :class="cn('flex flex-col gap-2 min-w-0 flex-1')"> <!-- เปลี่ยนจาก gap-3 -->
      <!-- Title Row -->
      <div :class="cn('flex items-start gap-2 flex-wrap')"> <!-- เปลี่ยนจาก gap-3 -->
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
          <p 
            v-if="subtitle" 
            :class="subtitleClasses"
          >
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </p>
          
          <!-- คำอธิบาย -->
          <div 
            v-if="description || $slots.description" 
            :class="descriptionClasses"
          >
            <slot name="description">
              {{ description }}
            </slot>
          </div>
        </div>
        
        <!-- Actions Section - ใช้ slot แทน AddDataButton -->
        <div v-if="$slots.actions" :class="actionsClasses">
          <slot name="actions" />
        </div>
      </div>
      <!-- Slot สำหรับ Content เพิ่มเติม -->
      <div 
        v-if="$slots.default" 
        :class="[
          animated && 'transition-all duration-1000 ease-out transform delay-500',
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        ]"
      >
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
  
  /* ปรับ title size สำหรับ mobile */
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

/* Hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
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

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>
