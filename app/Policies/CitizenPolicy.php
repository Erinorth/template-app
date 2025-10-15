<?php

namespace App\Policies;

use App\Models\Citizen;
use App\Models\User;
use Illuminate\Auth\Access\Response;
use Illuminate\Support\Facades\Log;

/**
 * Policy สำหรับจัดการสิทธิ์การเข้าถึงข้อมูล Citizen
 * ตาม role ที่กำหนดใน RoleUserSeeder (super admin, admin, member)
 */
class CitizenPolicy
{
    /**
     * ตรวจสอบสิทธิ์ก่อนเข้า method อื่นๆ
     * Super Admin มีสิทธิ์ทุกอย่างโดยอัตโนมัติ
     */
    public function before(User $user, string $ability): bool|null
    {
        // ให้ super admin ผ่านทุก permission โดยอัตโนมัติ
        if ($user->hasRole('super admin')) {
            Log::info('Super Admin bypass policy check', [
                'user_id' => $user->id,
                'ability' => $ability
            ]);
            return true;
        }

        // คืนค่า null เพื่อให้ไปตรวจสอบใน method ต่อไป
        return null;
    }

    /**
     * กำหนดว่า user สามารถดูรายการ citizens ทั้งหมดได้หรือไม่
     * อนุญาต: super admin, admin, member
     */
    public function viewAny(User $user): bool
    {
        $canView = $user->hasAnyRole(['super admin', 'admin', 'member']);
        
        Log::info('Check viewAny permission', [
            'user_id' => $user->id,
            'can_view' => $canView,
            'roles' => $user->getRoleNames()
        ]);

        return $canView;
    }

    /**
     * กำหนดว่า user สามารถดูข้อมูล citizen รายบุคคลได้หรือไม่
     * อนุญาต: super admin, admin, member
     */
    public function view(User $user, Citizen $citizen): bool
    {
        $canView = $user->hasAnyRole(['super admin', 'admin', 'member']);
        
        Log::info('Check view permission', [
            'user_id' => $user->id,
            'citizen_id' => $citizen->id,
            'can_view' => $canView,
            'roles' => $user->getRoleNames()
        ]);

        return $canView;
    }

    /**
     * กำหนดว่า user สามารถสร้าง citizen ใหม่ได้หรือไม่
     * อนุญาต: super admin, admin เท่านั้น
     */
    public function create(User $user): bool
    {
        $canCreate = $user->hasAnyRole(['super admin', 'admin']);
        
        Log::info('Check create permission', [
            'user_id' => $user->id,
            'can_create' => $canCreate,
            'roles' => $user->getRoleNames()
        ]);

        return $canCreate;
    }

    /**
     * กำหนดว่า user สามารถแก้ไขข้อมูล citizen ได้หรือไม่
     * อนุญาต: super admin, admin เท่านั้น
     */
    public function update(User $user, Citizen $citizen): bool
    {
        $canUpdate = $user->hasAnyRole(['super admin', 'admin']);
        
        Log::info('Check update permission', [
            'user_id' => $user->id,
            'citizen_id' => $citizen->id,
            'can_update' => $canUpdate,
            'roles' => $user->getRoleNames()
        ]);

        return $canUpdate;
    }

    /**
     * กำหนดว่า user สามารถลบข้อมูล citizen ได้หรือไม่
     * อนุญาต: super admin, admin เท่านั้น
     */
    public function delete(User $user, Citizen $citizen): bool
    {
        $canDelete = $user->hasAnyRole(['super admin', 'admin']);
        
        Log::info('Check delete permission', [
            'user_id' => $user->id,
            'citizen_id' => $citizen->id,
            'can_delete' => $canDelete,
            'roles' => $user->getRoleNames()
        ]);

        return $canDelete;
    }

    /**
     * กำหนดว่า user สามารถกู้คืนข้อมูล citizen ที่ถูกลบได้หรือไม่
     * อนุญาต: super admin เท่านั้น
     */
    public function restore(User $user, Citizen $citizen): bool
    {
        $canRestore = $user->hasRole('super admin');
        
        Log::info('Check restore permission', [
            'user_id' => $user->id,
            'citizen_id' => $citizen->id,
            'can_restore' => $canRestore,
            'roles' => $user->getRoleNames()
        ]);

        return $canRestore;
    }

    /**
     * กำหนดว่า user สามารถลบข้อมูล citizen ถาวรได้หรือไม่
     * อนุญาต: super admin เท่านั้น
     */
    public function forceDelete(User $user, Citizen $citizen): bool
    {
        $canForceDelete = $user->hasRole('super admin');
        
        Log::info('Check forceDelete permission', [
            'user_id' => $user->id,
            'citizen_id' => $citizen->id,
            'can_force_delete' => $canForceDelete,
            'roles' => $user->getRoleNames()
        ]);

        return $canForceDelete;
    }
}
