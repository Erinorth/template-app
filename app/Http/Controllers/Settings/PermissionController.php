<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Redirect;

class PermissionController extends Controller
{
    /* public function __construct()
    {
        $this->middleware('auth'); // Middleware สำหรับตรวจสอบการเข้าสู่ระบบ
    } */

    public function edit(Request $request): Response
    {
        $users = User::with('permissions')->get();

        $pivotData = $users->map(function ($user) {
            $permissions = ['can_read', 'can_create', 'can_edit', 'can_delete'];
            $result = ['id' => $user->id, 'egat_id' => $user->egat_id, 'name' => $user->name];
        
            foreach ($permissions as $permission) {
                $permissionName = Str::replace('_', '.', $permission);
                $result[$permission] = $user->permissions->contains('name', $permissionName) ? true : false;
            }
        
            return $result;
        });

        //dd($pivotData);

        return Inertia::render('settings/Permission', [
            'users' => $pivotData, // ส่งข้อมูล users ไปยัง Vue Component
        ]);
    }
}