<script setup lang="ts">
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData, type User } from '@/types';
import { Link, usePage } from '@inertiajs/vue3';
import { LayoutGrid, Users } from 'lucide-vue-next';
import { computed, watchEffect } from 'vue';
import AppLogo from './AppLogo.vue';

// ดึงข้อมูล page props พร้อมกับ type ที่ถูกต้อง
const page = usePage<SharedData>();

// สร้าง computed สำหรับ user
const user = computed((): User | null => {
    return page.props.auth?.user || null;
});

// สร้าง computed สำหรับเช็ค roles
const userRoles = computed((): string[] => {
    return user.value?.roles?.map(role => role.name) || [];
});

// ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่ (ย้ายมาก่อน watchEffect)
const isAdmin = computed((): boolean => {
    const roles = userRoles.value;
    
    // ตรวจสอบว่ามี role admin หรือ super admin หรือไม่
    const hasAdminRole = roles.includes('admin');
    const hasSuperAdminRole = roles.includes('super admin');
    const result = hasAdminRole || hasSuperAdminRole;
    
    console.log('🔍 Checking admin status (Spatie):');
    console.log('  - User roles:', roles);
    console.log('  - Has admin role:', hasAdminRole);
    console.log('  - Has super admin role:', hasSuperAdminRole);
    console.log('  - Is Admin result:', result);
    
    return result;
});

// สร้าง computed property สำหรับ footer nav items ที่แสดงตาม role
const footerNavItems = computed((): NavItem[] => {
    const baseItems: NavItem[] = [];

    console.log('🏗️ Building footer items (Spatie):');
    console.log('  - User roles:', userRoles.value);
    console.log('  - Is Admin:', isAdmin.value);
    
    // เพิ่ม User & Role Management เฉพาะสำหรับ admin
    if (isAdmin.value) {
        console.log('✅ Adding User & Role Management to footer nav');
        baseItems.push({
            title: 'User & Role Management',
            href: '/user-roles',
            icon: Users,
        });
    } else {
        console.log('❌ User is not admin, skipping User & Role Management');
        console.log('   Current user:', user.value?.name);
        console.log('   Current roles:', userRoles.value);
    }

    console.log('📋 Final footer items:', baseItems);
    return baseItems;
});

// ย้าย watchEffect ไปไว้หลังจากประกาศ computed properties ทั้งหมดแล้ว
watchEffect(() => {
    console.log('=== Debug AppSidebar (Spatie Permission) ===');
    console.log('Full page props:', page.props);
    console.log('Auth object:', page.props.auth);
    console.log('User object:', user.value);
    console.log('User roles array:', user.value?.roles);
    console.log('User role names:', userRoles.value);
    console.log('Is Admin result:', isAdmin.value);
    console.log('Footer nav items:', footerNavItems.value);
});

// รายการเมนูหลัก
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Data Table Demo',
        href: '/data-table-demo',
        icon: LayoutGrid,
    },
    {
        title: 'Payment',
        href: '/payments',
        icon: LayoutGrid,
    },
    {
        title: 'Payment2',
        href: '/payments2',
        icon: LayoutGrid,
    },
];

// Helper functions
const hasRole = (roleName: string): boolean => {
    return userRoles.value.includes(roleName);
};
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="route('dashboard')">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :items="mainNavItems" />
        </SidebarContent>

        <SidebarFooter>            
            <NavFooter :items="footerNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
