<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        
        // เพิ่ม log เพื่อตรวจสอบข้อมูล user และ roles
        if ($user) {
            $userRoles = $user->getRoleNames(); // ดึง role names จาก Spatie
            $isAdmin = $user->hasAnyRole(['admin', 'super admin']); // เช็คว่าเป็น admin หรือไม่
            
            \Log::info('🔍 HandleInertiaRequests - User Data:', [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $userRoles->toArray(),
                'is_admin' => $isAdmin,
                'has_super_admin' => $user->hasRole('super admin'),
                'has_admin' => $user->hasRole('admin'),
            ]);
        } else {
            \Log::info('❌ HandleInertiaRequests - No user found');
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'email_verified_at' => $user->email_verified_at?->toISOString(),
                    'created_at' => $user->created_at->toISOString(),
                    'updated_at' => $user->updated_at->toISOString(),
                    // เพิ่มข้อมูล roles จาก Spatie Permission
                    'roles' => $user->roles->map(function ($role) {
                        return [
                            'id' => $role->id,
                            'name' => $role->name,
                            'guard_name' => $role->guard_name,
                        ];
                    })->toArray(),
                    // เพิ่ม permissions (optional)
                    'permissions' => $user->getAllPermissions()->pluck('name')->toArray(),
                ] : null,
            ],
            'app' => [
                'debug' => config('app.debug'),
                'environment' => config('app.env'),
            ],
        ]);
    }
}
