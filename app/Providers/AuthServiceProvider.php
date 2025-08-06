<?php

namespace App\Providers;

use App\Models\User;
use App\Policies\UserRolePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * ระบุการจับคู่ระหว่าง model และ policy
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserRolePolicy::class,
    ];

    /**
     * ลงทะเบียน authentication / authorization services
     */
    public function boot(): void
    {
        Log::info('🔧 AuthServiceProvider - เริ่มการลงทะเบียน policies');
        
        $this->registerPolicies();
        
        // Debug: ตรวจสอบ policies ที่ลงทะเบียนแล้ว
        Log::info('🔧 AuthServiceProvider - Policies ที่ลงทะเบียนแล้ว', [
            'policies' => $this->policies
        ]);

        // เพิ่ม Gate สำหรับ debug การทำงานของ authorization
        Gate::before(function ($user, $ability) {
            Log::info('🔍 Gate - Before: ตรวจสอบก่อนการอนุญาต', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'ability' => $ability,
                'user_roles' => $user->getRoleNames()->toArray()
            ]);
        });

        Gate::after(function ($user, $ability, $result, $arguments = []) {
            Log::info('🔍 Gate - After: ผลการตรวจสอบการอนุญาต', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'ability' => $ability,
                'result' => $result ? 'ALLOWED' : 'DENIED',
                'arguments' => $arguments
            ]);
        });
        
        Log::info('✅ AuthServiceProvider - การลงทะเบียน policies เสร็จสิ้น');
    }
}
