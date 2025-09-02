<?php

namespace App\Http\Controllers\UserRole;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRole\AssignRoleRequest;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
{
    use AuthorizesRequests;

    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        
        // ตรวจสอบสิทธิ์ด้วย middleware เพื่อความแน่ใจ
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            
            Log::info('🔍 UserRoleController - ตรวจสอบสิทธิ์การเข้าถึง', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_roles' => $user->getRoleNames()->toArray(),
                'route' => $request->route()->getName()
            ]);
            
            if (!$user->hasAnyRole(['super admin', 'admin'])) {
                Log::warning('🚫 UserRoleController - ไม่มีสิทธิ์เข้าถึง', [
                    'user_id' => $user->id,
                    'user_roles' => $user->getRoleNames()->toArray()
                ]);
                abort(403, 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบ');
            }
            
            Log::info('✅ UserRoleController - อนุญาตให้เข้าถึงได้');
            return $next($request);
        });
    }

    /**
     * แสดงหน้าจัดการ role ของ users
     */
    public function index(Request $request)
    {
        $currentUser = auth()->user();
        
        Log::info('📋 UserRoleController - แสดงหน้าจัดการ User Roles', [
            'user_id' => $currentUser->id,
            'user_name' => $currentUser->name,
            'search_term' => $request->get('search'),
            'page' => $request->get('page', 1)
        ]);
        
        $query = User::with(['roles'])->orderBy('name');
        
        // ถ้าเป็น admin ให้เห็นเฉพาะคนในหน่วยงานเดียวกัน
        if ($currentUser->hasRole('admin') && !$currentUser->hasRole('super admin')) {
            $query->where('department', $currentUser->department);
            Log::info('🏢 UserRoleController - กรอง users ตามหน่วยงาน', [
                'admin_department' => $currentUser->department
            ]);
        }
        
        // ค้นหาตาม keyword
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
            
            Log::info('🔍 UserRoleController - ค้นหา users', [
                'search_term' => $search
            ]);
        }
        
        $users = $query->paginate(15)->withQueryString();
        
        // กำหนด roles ที่สามารถมอบได้ตาม permission
        $availableRoles = $this->getAvailableRoles();
        
        Log::info('📊 UserRoleController - ข้อมูลที่จะส่งไปแสดงผล', [
            'total_users' => $users->total(),
            'current_page_users' => $users->count(),
            'available_roles_count' => $availableRoles->count(),
            'available_roles' => $availableRoles->pluck('name')->toArray()
        ]);
        
        return Inertia::render('UserRoles/Index', [
            'users' => $users,
            'availableRoles' => $availableRoles,
            'filters' => $request->only(['search']),
            'currentUser' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'roles' => $currentUser->getRoleNames()->toArray(),
                'is_super_admin' => $currentUser->hasRole('super admin'),
                'is_admin' => $currentUser->hasRole('admin')
            ]
        ]);
    }
    
    /**
     * อัปเดต role ของ user
     */
    public function updateRole(AssignRoleRequest $request, User $user)
    {
        $currentUser = auth()->user();
        $newRoleName = $request->validated()['role'];
        
        Log::info('🔄 UserRoleController - เริ่มอัปเดต role', [
            'current_user_id' => $currentUser->id,
            'current_user_name' => $currentUser->name,
            'target_user_id' => $user->id,
            'target_user_name' => $user->name,
            'old_roles' => $user->getRoleNames()->toArray(),
            'new_role' => $newRoleName
        ]);
        
        // ตรวจสอบว่าไม่ใช่การแก้ไขตัวเอง
        if ($currentUser->id === $user->id) {
            Log::warning('🚫 UserRoleController - พยายามแก้ไข role ตัวเอง', [
                'user_id' => $currentUser->id
            ]);
            return back()->with('error', 'ไม่สามารถแก้ไข role ของตัวเองได้');
        }
        
        // ตรวจสอบสิทธิ์ตาม role
        if (!$this->canUserManageTarget($currentUser, $user, $newRoleName)) {
            Log::warning('🚫 UserRoleController - ไม่มีสิทธิ์แก้ไข user นี้', [
                'current_user_roles' => $currentUser->getRoleNames()->toArray(),
                'target_user_roles' => $user->getRoleNames()->toArray(),
                'requested_role' => $newRoleName
            ]);
            return back()->with('error', 'คุณไม่มีสิทธิ์แก้ไข role ของผู้ใช้คนนี้');
        }
        
        try {
            $oldRoles = $user->getRoleNames()->toArray();
            
            // ลบ role เดิมทั้งหมดและใส่ role ใหม่
            if ($newRoleName) {
                $user->syncRoles([$newRoleName]);
                $message = "อัปเดต role ของ {$user->name} เป็น {$newRoleName} เรียบร้อยแล้ว";
            } else {
                $user->syncRoles([]);
                $message = "ลบ role ทั้งหมดของ {$user->name} เรียบร้อยแล้ว";
            }
            
            Log::info('✅ UserRoleController - อัปเดต role สำเร็จ', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'old_roles' => $oldRoles,
                'new_role' => $newRoleName,
                'updated_by' => $currentUser->name
            ]);
            
            return back()->with('success', $message);
            
        } catch (\Exception $e) {
            Log::error('❌ UserRoleController - เกิดข้อผิดพลาดในการอัปเดต role', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->with('error', 'เกิดข้อผิดพลาดในการอัปเดต role กรุณาลองใหม่อีกครั้ง');
        }
    }
    
    /**
     * ลบ role ของ user (ใช้สำหรับลบ role ทั้งหมด)
     */
    public function removeRole(User $user)
    {
        $currentUser = auth()->user();
        
        Log::info('🗑️ UserRoleController - เริ่มลบ role', [
            'current_user_id' => $currentUser->id,
            'current_user_name' => $currentUser->name,
            'target_user_id' => $user->id,
            'target_user_name' => $user->name,
            'target_current_roles' => $user->getRoleNames()->toArray()
        ]);
        
        // ตรวจสอบว่าไม่ใช่การแก้ไขตัวเอง
        if ($currentUser->id === $user->id) {
            Log::warning('🚫 UserRoleController - พยายามลบ role ตัวเอง');
            return back()->with('error', 'ไม่สามารถลบ role ของตัวเองได้');
        }
        
        // ตรวจสอบสิทธิ์
        if (!$this->canUserManageTarget($currentUser, $user, null)) {
            Log::warning('🚫 UserRoleController - ไม่มีสิทธิ์ลบ role ของ user นี้');
            return back()->with('error', 'คุณไม่มีสิทธิ์ลบ role ของผู้ใช้คนนี้');
        }
        
        try {
            $oldRoles = $user->getRoleNames()->toArray();
            $user->syncRoles([]);
            
            Log::info('✅ UserRoleController - ลบ role สำเร็จ', [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'removed_roles' => $oldRoles,
                'removed_by' => $currentUser->name
            ]);
            
            return back()->with('success', "ลบ role ทั้งหมดของ {$user->name} เรียบร้อยแล้ว");
            
        } catch (\Exception $e) {
            Log::error('❌ UserRoleController - เกิดข้อผิดพลาดในการลบ role', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->with('error', 'เกิดข้อผิดพลาดในการลบ role กรุณาลองใหม่อีกครั้ง');
        }
    }
    
    /**
     * ดึง roles ที่สามารถมอบได้ตาม permission ของ user ปัจจุบัน
     */
    private function getAvailableRoles()
    {
        $currentUser = auth()->user();
        
        Log::info('📋 UserRoleController - ดึงรายการ roles ที่สามารถมอบได้', [
            'user_id' => $currentUser->id,
            'user_roles' => $currentUser->getRoleNames()->toArray()
        ]);
        
        if ($currentUser->hasRole('super admin')) {
            // Super admin สามารถมอบ role ทั้งหมดได้
            $roles = Role::orderBy('name')->get();
            Log::info('👑 UserRoleController - Super admin สามารถมอบ role ทั้งหมดได้');
            return $roles;
        }
        
        if ($currentUser->hasRole('admin')) {
            // Admin สามารถมอบ role member ได้เท่านั้น
            $roles = Role::whereIn('name', ['member'])->orderBy('name')->get();
            Log::info('🔧 UserRoleController - Admin สามารถมอบได้เฉพาะ role member');
            return $roles;
        }
        
        // User อื่นๆ ไม่สามารถมอบ role ได้
        Log::info('🚫 UserRoleController - User ไม่มีสิทธิ์มอบ role ใดๆ');
        return collect([]);
    }
    
    /**
     * ตรวจสอบว่า user สามารถจัดการ target user ได้หรือไม่
     */
    private function canUserManageTarget(User $currentUser, User $targetUser, ?string $newRole): bool
    {
        // Super admin สามารถจัดการทุกคนได้ (ยกเว้นตัวเอง)
        if ($currentUser->hasRole('super admin')) {
            return true;
        }
        
        // Admin สามารถจัดการคนในหน่วยงานเดียวกันได้
        if ($currentUser->hasRole('admin')) {
            // ตรวจสอบหน่วยงานเดียวกัน
            if ($currentUser->department !== $targetUser->department) {
                return false;
            }
            
            // Admin ไม่สามารถจัดการ super admin หรือ admin คนอื่นได้
            if ($targetUser->hasAnyRole(['super admin', 'admin'])) {
                return false;
            }
            
            // Admin สามารถมอบได้เฉพาะ role member หรือลบ role
            if ($newRole && !in_array($newRole, ['member'])) {
                return false;
            }
            
            return true;
        }
        
        // User อื่นๆ ไม่สามารถจัดการได้
        return false;
    }
}
