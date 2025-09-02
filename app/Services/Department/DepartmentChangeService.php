<?php

namespace App\Services\Department;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DepartmentChangeService
{
    /**
     * ตรวจสอบและจัดการการเปลี่ยนแปลงหน่วยงาน
     */
    public function handleDepartmentChange(User $user, ?string $newDepartment): void
    {
        if (is_null($newDepartment)) {
            Log::debug('ไม่มีข้อมูลหน่วยงานใหม่จาก Census', ['user_id' => $user->id]);
            return;
        }

        if ($user->department === $newDepartment) {
            Log::debug('หน่วยงานไม่เปลี่ยนแปลง', [
                'user_id' => $user->id,
                'department' => $user->department
            ]);
            return;
        }

        Log::info('ตรวจพบการเปลี่ยนแปลงหน่วยงาน - กำลังลบ role ทั้งหมด', [
            'user_id' => $user->id,
            'old_department' => $user->department,
            'new_department' => $newDepartment
        ]);

        try {
            DB::transaction(function () use ($user) {
                $this->removeAllUserRoles($user);
            });

            $this->logDepartmentChangeHistory($user, $newDepartment);

        } catch (\Exception $e) {
            Log::error('เกิดข้อผิดพลาดในการลบ role เมื่อเปลี่ยนหน่วยงาน', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * ลบ role ทั้งหมดของผู้ใช้
     */
    private function removeAllUserRoles(User $user): void
    {
        if (method_exists($user, 'roles')) {
            $oldRolesCount = $user->roles()->count();
            $user->roles()->detach();
            
            Log::info('ลบ role ของผู้ใช้สำเร็จ', [
                'user_id' => $user->id,
                'roles_removed_count' => $oldRolesCount
            ]);
        } else {
            Log::warning('ไม่พบ relationship roles() ในโมเดล User', ['user_id' => $user->id]);
        }
    }

    /**
     * บันทึกประวัติการเปลี่ยนแปลงหน่วยงาน
     */
    private function logDepartmentChangeHistory(User $user, string $newDepartment): void
    {
        Log::info('บันทึกประวัติการเปลี่ยนแปลงหน่วยงาน', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'old_department' => $user->department,
            'new_department' => $newDepartment,
            'changed_at' => now()->toDateTimeString(),
            'changed_by' => 'System - EGAT Login Process'
        ]);

        // สามารถเพิ่ม logic บันทึกลงตาราง audit log ได้ที่นี่
    }

    /**
     * ตรวจสอบว่าผู้ใช้มี role อยู่หรือไม่
     */
    public function hasUserRoles(User $user): bool
    {
        if (!method_exists($user, 'roles')) {
            return false;
        }

        return $user->roles()->exists();
    }
}
