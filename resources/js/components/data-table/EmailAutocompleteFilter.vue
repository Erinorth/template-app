<script setup lang="ts">
import { computed } from 'vue'
import type { Column } from '@tanstack/vue-table'
import type { Payment } from '@/types/payment'
import { useEmailAutocompleteFilter } from '@/composables/useTableFilters'
import { Mail, Search, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Props definition
interface Props {
  column: Column<Payment, any>
}

const props = defineProps<Props>()

// ใช้ composable สำหรับจัดการ email autocomplete filter
const { open, inputValue, emailSuggestions, selectEmail, clearFilter } = useEmailAutocompleteFilter(props.column)

const hasFilter = computed(() => inputValue.value !== '')
</script>

<template>
  <div class="space-y-2">
    <!-- Input Field -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
      <Input
        v-model="inputValue"
        placeholder="ค้นหาอีเมล..."
        class="pl-8 h-8 text-sm"
        @update:model-value="column.setFilterValue($event)"
      />
      <Button
        v-if="hasFilter"
        variant="ghost"
        size="sm"
        @click="clearFilter"
        class="absolute right-1 top-1/2 h-6 w-6 p-0 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        <X class="w-3 h-3" />
      </Button>
    </div>

    <!-- Suggestions Dropdown -->
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="h-6 w-full justify-start text-xs text-muted-foreground"
          :class="{ 'opacity-0 pointer-events-none': emailSuggestions.length === 0 }"
        >
          <Mail class="w-3 h-3 mr-1" />
          {{ emailSuggestions.length }} คำแนะนำ
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="ค้นหาอีเมล..." />
          <CommandList>
            <CommandEmpty>ไม่พบอีเมลที่ตรงกัน</CommandEmpty>
            <CommandGroup heading="อีเมลที่พบ">
              <CommandItem
                v-for="suggestion in emailSuggestions"
                :key="suggestion.value"
                :value="suggestion.value"
                @select="selectEmail(suggestion.value)"
                class="flex items-center justify-between cursor-pointer"
              >
                <div class="flex items-center">
                  <Mail class="mr-2 h-3 w-3" />
                  <span class="text-sm">{{ suggestion.value }}</span>
                </div>
                <Badge variant="secondary" class="text-xs">
                  {{ suggestion.count }}
                </Badge>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <!-- Current Filter Display -->
    <div
      v-if="hasFilter"
      class="text-xs text-muted-foreground"
    >
      <span>กรองด้วย: </span>
      <Badge variant="secondary" class="text-xs">
        {{ inputValue }}
      </Badge>
    </div>
  </div>
</template>
