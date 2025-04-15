<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  column: Object,
})

function toggleSort() {
  props.column.toggleSorting()
}
</script>

<template>
  <button @click="toggleSort" class="font-bold">
    {{ column.columnDef.header }}
    <span v-if="column.getIsSorted() === 'asc'">⬆️</span>
    <span v-else-if="column.getIsSorted() === 'desc'">⬇️</span>
  </button>
</template>
