<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;

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

    public function update(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'permission' => 'required|in:can_read,can_create,can_edit,can_delete',
            'value' => 'required|boolean',
        ]);
        
        $user = User::findOrFail($validated['user_id']);
        $permissionName = $validated['permission'];
        
        // ตรวจสอบว่ามี permission ในระบบหรือไม่
        $permission = Permission::firstOrCreate(['name' => $permissionName]);
        
        if ($validated['value']) {
            $user->givePermissionTo($permission);
        } else {
            $user->revokePermissionTo($permission);
        }
        
        return redirect()->back()->with('success', 'อัปเดตสิทธิ์เรียบร้อย');
    }
}