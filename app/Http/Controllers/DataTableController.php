<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DataTableController extends Controller
{
    public function index(Request $request): Response
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

        return Inertia::render('DataTable', [
            'users' => $pivotData, // ส่งข้อมูล users ไปยัง Vue Component
        ]);
    }
}
