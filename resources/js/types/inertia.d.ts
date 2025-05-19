// resources/js/types/inertia.d.ts
import { Page } from '@inertiajs/core';

// กำหนดโครงสร้างของ PageProps ที่ส่งมาจาก Laravel
declare module '@inertiajs/core' {
  interface PageProps {
    ziggy?: {
      location?: string;
      // เพิ่ม property อื่นๆ ของ ziggy ตามที่คุณใช้
      url?: string;
      port?: number;
      defaults?: Record<string, any>;
      routes?: Record<string, any>;
    };
    auth?: {
      user?: {
        id: number;
        name: string;
        email: string;
        // เพิ่ม property อื่นๆ ตามที่คุณมีในระบบ
      } | null;
    };
    flash?: {
      message?: string;
      // เพิ่ม property อื่นๆ ตามที่คุณใช้
    };
    // เพิ่ม property อื่นๆ ที่คุณส่งมาจาก Laravel
  }
}

// กำหนด type สำหรับ usePage function
declare module '@inertiajs/vue3' {
  export function usePage<T = PageProps>(): Page<T>;
}
