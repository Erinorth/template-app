<?php

namespace App\Http\Requests\UserRole;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class AssignRoleRequest extends FormRequest
{
    /**
     * ตรวจสอบว่า user มีสิทธิ์ทำ request นี้หรือไม่
     */
    public function authorize(): bool
    {
        Log::info('🔍 AssignRoleRequest - ตรวจสอบการอนุญาต', [
            'user_id' => $this->user()->id,
            'user_roles' => $this->user()->getRoleNames()->toArray()
        ]);
        
        // Authorization จะถูกจัดการใน Policy และ Controller
        return true;
    }

    /**
     * กำหนด validation rules
     */
    public function rules(): array
    {
        return [
            'role' => [
                'nullable',
                'string',
                'exists:roles,name',
                function ($attribute, $value, $fail) {
                    if ($value && !$this->isRoleAllowed($value)) {
                        Log::warning('🚫 AssignRoleRequest - Role ไม่ได้รับอนุญาต', [
                            'user_id' => $this->user()->id,
                            'requested_role' => $value,
                            'user_roles' => $this->user()->getRoleNames()->toArray()
                        ]);
                        $fail('คุณไม่มีสิทธิ์มอบ role นี้');
                    }
                }
            ]
        ];
    }

    /**
     * กำหนดข้อความ error สำหรับ validation
     */
    public function messages(): array
    {
        return [
            'role.exists' => 'Role ที่เลือกไม่ถูกต้อง',
            'role.string' => 'Role ต้องเป็นข้อความ'
        ];
    }

    /**
     * ตรวจสอบว่า role ที่เลือกเป็น role ที่ user สามารถมอบได้หรือไม่
     */
    private function isRoleAllowed(string $roleName): bool
    {
        $currentUser = $this->user();
        
        Log::info('🔍 AssignRoleRequest - ตรวจสอบสิทธิ์มอบ role', [
            'current_user_id' => $currentUser->id,
            'current_user_name' => $currentUser->name,
            'requested_role' => $roleName,
            'current_user_roles' => $currentUser->getRoleNames()->toArray()
        ]);
        
        // Super admin สามารถมอบ role ทั้งหมดได้
        if ($currentUser->hasRole('super admin')) {
            Log::info('✅ AssignRoleRequest - Super admin สามารถมอบ role ใดก็ได้');
            return true;
        }
        
        // Admin สามารถมอบเฉพาะ role member ได้
        if ($currentUser->hasRole('admin')) {
            $isAllowed = $roleName === 'member';
            Log::info('🔍 AssignRoleRequest - Admin ตรวจสอบสิทธิ์', [
                'requested_role' => $roleName,
                'is_allowed' => $isAllowed ? 'YES' : 'NO'
            ]);
            return $isAllowed;
        }
        
        // User อื่นๆ ไม่สามารถมอบ role ใดๆ ได้
        Log::info('🚫 AssignRoleRequest - User ไม่มีสิทธิ์มอบ role');
        return false;
    }

    /**
     * กำหนดค่าเพิ่มเติมสำหรับ validator
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->filled('role')) {
                $role = Role::where('name', $this->input('role'))->first();
                if (!$role) {
                    Log::error('❌ AssignRoleRequest - Role ไม่พบในระบบ', [
                        'requested_role' => $this->input('role')
                    ]);
                    $validator->errors()->add('role', 'ไม่พบ role ที่เลือกในระบบ');
                }
            }
        });
    }

    /**
     * เตรียมข้อมูลสำหรับ validation
     */
    protected function prepareForValidation(): void
    {
        Log::info('📝 AssignRoleRequest - เตรียมข้อมูลสำหรับ validation', [
            'raw_data' => $this->all()
        ]);
        
        // ทำความสะอาด role ที่ส่งมา
        if ($this->has('role') && $this->input('role') === '') {
            $this->merge(['role' => null]);
        }
    }
}
