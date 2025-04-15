<script setup lang="ts">
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['prev-page', 'next-page', 'go-to-page'])

function goToPage(page) {
  if (page >= 1 && page <= props.totalPages) {
    emit('go-to-page', page)
  }
}
</script>

<template>
  <div class="flex justify-between items-center py-4">
    <!-- ปุ่มย้อนกลับ -->
    <button
      @click="$emit('prev-page')"
      :disabled="currentPage === 1"
      class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
    >
      ก่อนหน้า
    </button>

    <!-- แสดงหน้าปัจจุบัน -->
    <span>หน้า {{ currentPage }} จาก {{ totalPages }}</span>

    <!-- ปุ่มถัดไป -->
    <button
      @click="$emit('next-page')"
      :disabled="currentPage === totalPages"
      class="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
    >
      ถัดไป
    </button>
  </div>
</template>

<style scoped>
button {
  cursor: pointer;
}
button[disabled] {
  cursor: not-allowed;
}
</style>
