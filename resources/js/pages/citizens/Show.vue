<script setup lang="ts">
import { computed } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import type { BreadcrumbItem } from '@/types';
import type { Citizen } from './types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  FileText,
  Clock,
  Info
} from 'lucide-vue-next';
import { formatThaiCitizenId } from '@/lib/utils';
import { useCitizens } from './use';

// Props ที่ส่งมาจาก Controller
const props = defineProps<{
  title?: string;
  citizen: Citizen;
}>();

// Breadcrumb สำหรับการนำทาง
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: 'dashboard',
  },
  {
    title: 'ข้อมูลประชากร',
    href: 'citizens',
  },
  {
    title: 'รายละเอียด',
    href: `citizens.show`,
  },
];

// ใช้ CRUD operations จาก composable
const { editCitizen, deleteCitizen } = useCitizens();

// จัดรูปแบบวันที่เป็นภาษาไทย - รองรับ undefined
const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// จัดรูปแบบวันที่และเวลาเป็นภาษาไทย - รองรับ undefined
const formatDateTime = (date: string | null | undefined): string => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// คำนวณอายุจากวันเกิด
const calculateAge = computed(() => {
  if (!props.citizen.birth_date) return null;
  
  const birthDate = new Date(props.citizen.birth_date);
  const today = new Date();
  const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  
  return age;
});

// จัดรูปแบบเลขบัตรประชาชน
const formattedCitizenId = computed(() => {
  if (!props.citizen.citizen_id) return '-';
  return formatThaiCitizenId(props.citizen.citizen_id);
});

// ฟังก์ชันสำหรับย้อนกลับไปหน้าก่อนหน้า
function goBack() {
  console.log('[CitizenShow] Navigating back to index');
  router.visit(route('citizens.index'));
}

// ฟังก์ชันสำหรับแก้ไขข้อมูล
function handleEdit() {
  console.log('[CitizenShow] Editing citizen', { id: props.citizen.id, citizen_id: props.citizen.citizen_id });
  editCitizen(props.citizen);
}

// ฟังก์ชันสำหรับลบข้อมูล
function handleDelete() {
  console.log('[CitizenShow] Deleting citizen', { id: props.citizen.id, citizen_id: props.citizen.citizen_id });
  deleteCitizen(props.citizen);
}

// Log เมื่อ component ถูกสร้าง
console.log('[CitizenShow] Component initialized', {
  citizenId: props.citizen.id,
  citizen_id: props.citizen.citizen_id,
  hasRemark: !!props.citizen.remark,
});
</script>

<template>
  <!-- Head สำหรับตั้งค่า title ของหน้า -->
  <Head :title="props.title ?? 'รายละเอียดข้อมูลประชากร'" />

  <!-- AppLayout พร้อม breadcrumbs -->
  <AppLayout :breadcrumbs="breadcrumbs">
    <!-- Container หลัก - รองรับ Responsive Design -->
    <div class="container mx-auto py-4 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <!-- Header Section พร้อมปุ่ม Action -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <!-- ส่วนหัวและปุ่มย้อนกลับ -->
        <div class="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            @click="goBack"
            class="flex-shrink-0"
          >
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {{ props.title ?? 'รายละเอียดข้อมูลประชากร' }}
            </h1>
            <p class="text-sm text-muted-foreground mt-1">
              ข้อมูลรายละเอียดของประชากร ID: {{ props.citizen.id }}
            </p>
          </div>
        </div>

        <!-- ปุ่ม Actions สำหรับแก้ไขและลบ -->
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="default"
            @click="handleEdit"
            class="gap-2"
          >
            <Edit class="h-4 w-4" />
            <span class="hidden sm:inline">แก้ไข</span>
          </Button>
          <Button
            variant="destructive"
            size="default"
            @click="handleDelete"
            class="gap-2"
          >
            <Trash2 class="h-4 w-4" />
            <span class="hidden sm:inline">ลบ</span>
          </Button>
        </div>
      </div>

      <!-- Content Section - Grid Layout สำหรับ Responsive -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Card หลัก: ข้อมูลประชากร -->
        <Card class="lg:col-span-2">
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="flex items-center gap-2">
                <User class="h-5 w-5" />
                ข้อมูลประชากร
              </CardTitle>
              <Badge variant="secondary" class="text-xs">
                ID: {{ String(props.citizen.id).padStart(6, '0') }}
              </Badge>
            </div>
            <CardDescription>
              ข้อมูลพื้นฐานของประชากร
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- เลขบัตรประชาชน -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText class="h-4 w-4" />
                <span>เลขบัตรประชาชน</span>
              </div>
              <p class="text-lg font-mono font-semibold">
                {{ formattedCitizenId }}
              </p>
            </div>

            <Separator />

            <!-- วันเกิด -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar class="h-4 w-4" />
                <span>วันเกิด</span>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p class="text-base font-medium">
                  {{ formatDate(props.citizen.birth_date) }}
                </p>
                <Badge v-if="calculateAge" variant="outline" class="w-fit">
                  อายุ {{ calculateAge }} ปี
                </Badge>
              </div>
            </div>

            <Separator />

            <!-- หมายเหตุ -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Info class="h-4 w-4" />
                <span>หมายเหตุ</span>
              </div>
              <div v-if="props.citizen.remark" class="p-3 bg-muted rounded-md">
                <p class="text-sm whitespace-pre-wrap break-words">
                  {{ props.citizen.remark }}
                </p>
              </div>
              <Alert v-else>
                <AlertDescription class="text-sm text-muted-foreground">
                  ไม่มีหมายเหตุ
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <!-- Card ด้านข้าง: ข้อมูลระบบ -->
        <Card class="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <Clock class="h-4 w-4" />
              ข้อมูลระบบ
            </CardTitle>
            <CardDescription class="text-xs">
              ข้อมูลการสร้างและแก้ไข
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- วันที่สร้าง -->
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground">สร้างเมื่อ</p>
              <p class="text-sm font-medium">
                {{ formatDateTime(props.citizen.created_at) }}
              </p>
            </div>

            <Separator />

            <!-- วันที่แก้ไขล่าสุด -->
            <div class="space-y-1">
              <p class="text-xs text-muted-foreground">แก้ไขล่าสุด</p>
              <p class="text-sm font-medium">
                {{ formatDateTime(props.citizen.updated_at) }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>
