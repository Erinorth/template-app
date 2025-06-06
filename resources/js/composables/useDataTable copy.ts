import { ref, computed, watch } from 'vue';

export interface UseDataTableOptions<T = any> {
  data: T[];
  searchableFields?: (keyof T)[];
  defaultSort?: {
    field: keyof T;
    direction: 'asc' | 'desc';
  };
  pageSize?: number;
}

export function useDataTable<T = any>(options: UseDataTableOptions<T>) {
  // รีแอคทีฟ สเตต
  const searchQuery = ref('');
  const sortField = ref<keyof T | null>(options.defaultSort?.field || null);
  const sortDirection = ref<'asc' | 'desc'>(options.defaultSort?.direction || 'asc');
  const currentPage = ref(1);
  const pageSize = ref(options.pageSize || 10);

  // ฟิลเตอร์ข้อมูลตามการค้นหา
  const filteredData = computed(() => {
    if (!searchQuery.value) return options.data;

    const query = searchQuery.value.toLowerCase();
    return options.data.filter(item => {
      if (options.searchableFields) {
        return options.searchableFields.some(field => {
          const value = item[field];
          return String(value).toLowerCase().includes(query);
        });
      } else {
        return Object.values(item as any).some(value =>
          String(value).toLowerCase().includes(query)
        );
      }
    });
  });

  // เรียงลำดับข้อมูล
  const sortedData = computed(() => {
    if (!sortField.value) return filteredData.value;

    return [...filteredData.value].sort((a, b) => {
      const aValue = a[sortField.value!];
      const bValue = b[sortField.value!];

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortDirection.value === 'desc' ? -comparison : comparison;
    });
  });

  // คำนวณข้อมูลสำหรับ pagination
  const totalItems = computed(() => sortedData.value.length);
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));

  // ข้อมูลที่แสดงในหน้าปัจจุบัน
  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return sortedData.value.slice(start, end);
  });

  // ฟังก์ชันสำหรับเรียงลำดับ
  const handleSort = (field: keyof T) => {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortField.value = field;
      sortDirection.value = 'asc';
    }
  };

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  // รีเซ็ตหน้าเมื่อมีการค้นหาหรือเปลี่ยนขนาดหน้า
  watch([searchQuery, pageSize], () => {
    currentPage.value = 1;
  });

  return {
    // States
    searchQuery,
    sortField,
    sortDirection,
    currentPage,
    pageSize,
    
    // Computed
    filteredData,
    sortedData,
    paginatedData,
    totalItems,
    totalPages,
    
    // Methods
    handleSort,
    goToPage
  };
}
