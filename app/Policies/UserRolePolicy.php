<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Log;

class UserRolePolicy
{
    use HandlesAuthorization;

    /**
     * ตรวจสอบว่าสามารถดูรายการ users ทั้งหมดได้หรือไม่
     */
    public function viewAny(User $user): bool
    {
        Log::info('🔍 UserRolePolicy - viewAny: ตรวจสอบสิทธิ์ดูรายการ users', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'user_roles' => $user->getRoleNames()->toArray(),
            'has_super_admin' => $user->hasRole('super admin'),
            'has_admin' => $user->hasRole('admin'),
            'has_any_admin_role' => $user->hasAnyRole(['super admin', 'admin'])
        ]);

        $canView = $user->hasAnyRole(['super admin', 'admin']);
        
        Log::info('🔍 UserRolePolicy - viewAny: ผลลัพธ์', [
            'user_id' => $user->id,
            'can_view' => $canView ? 'ALLOWED' : 'DENIED',
            'reason' => $canView ? 'User มี role ที่เหมาะสม' : 'User ไม่มี role ที่เหมาะสม'
        ]);
        
        return $canView;
    }

    /**
     * ตรวจสอบว่าสามารถดู user คนนั้นๆ ได้หรือไม่
     */
    public function view(User $user, User $targetUser): bool
    {
        Log::info('🔍 UserRolePolicy - view: ตรวจสอบสิทธิ์ดู user เฉพาะราย', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'target_user_id' => $targetUser->id,
            'target_user_name' => $targetUser->name
        ]);

        // Super admin สามารถดูทุกคนได้
        if ($user->hasRole('super admin')) {
            Log::info('✅ UserRolePolicy - view: ALLOWED (super admin)');
            return true;
        }
        
        // Admin สามารถดูเฉพาะคนในหน่วยงานเดียวกันได้
        if ($user->hasRole('admin')) {
            $sameDepartment = $user->department === $targetUser->department;
            
            Log::info('🔍 UserRolePolicy - view: ตรวจสอบ admin', [
                'admin_id' => $user->id,
                'admin_department' => $user->department,
                'target_user_id' => $targetUser->id,
                'target_department' => $targetUser->department,
                'same_department' => $sameDepartment,
                'result' => $sameDepartment ? 'ALLOWED' : 'DENIED'
            ]);
            
            return $sameDepartment;
        }
        
        Log::info('🚫 UserRolePolicy - view: DENIED (ไม่มี role ที่เหมาะสม)');
        return false;
    }

    /**
     * ตรวจสอบว่าสามารถอัปเดต role ของ user ได้หรือไม่
     */
    public function update(User $user, User $targetUser): bool
    {
        Log::info('🔍 UserRolePolicy - update: ตรวจสอบสิทธิ์อัปเดต role', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_roles' => $user->getRoleNames()->toArray(),
            'target_user_id' => $targetUser->id,
            'target_user_name' => $targetUser->name,
            'target_user_roles' => $targetUser->getRoleNames()->toArray()
        ]);

        // ไม่สามารถแก้ไข role ของตัวเองได้
        if ($user->id === $targetUser->id) {
            Log::info('🚫 UserRolePolicy - update: DENIED (พยายามแก้ไขตัวเอง)');
            return false;
        }
        
        // Super admin สามารถแก้ไข role ของทุกคนได้ (ยกเว้นตัวเอง)
        if ($user->hasRole('super admin')) {
            Log::info('✅ UserRolePolicy - update: ALLOWED (super admin)');
            return true;
        }
        
        // Admin สามารถแก้ไข role ของคนในหน่วยงานเดียวกันได้ (เฉพาะ member)
        if ($user->hasRole('admin')) {
            $sameDepartment = $user->department === $targetUser->department;
            $targetIsNotAdmin = !$targetUser->hasAnyRole(['super admin', 'admin']);
            $canUpdate = $sameDepartment && $targetIsNotAdmin;
            
            Log::info('🔍 UserRolePolicy - update: ตรวจสอบ admin', [
                'admin_id' => $user->id,
                'admin_department' => $user->department,
                'target_user_id' => $targetUser->id,
                'target_department' => $targetUser->department,
                'same_department' => $sameDepartment,
                'target_has_admin_role' => $targetUser->hasAnyRole(['super admin', 'admin']),
                'target_is_not_admin' => $targetIsNotAdmin,
                'can_update' => $canUpdate,
                'result' => $canUpdate ? 'ALLOWED' : 'DENIED'
            ]);
            
            return $canUpdate;
        }
        
        Log::info('🚫 UserRolePolicy - update: DENIED (ไม่มี role ที่เหมาะสม)');
        return false;
    }
}
