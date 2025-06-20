<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;

uses(RefreshDatabase::class);

beforeEach(function () {
    // สร้างผู้ใช้สำหรับทดสอบ
    $this->user = User::factory()->create([
        'egat_id' => 'TEST001',
        'name' => 'Test User',
        'email' => 'test@example.com'
    ]);
    
    // สร้างผู้ใช้เพิ่มเติมสำหรับทดสอบการแสดงรายการ
    $this->users = User::factory()->count(3)->create([
        'egat_id' => fake()->unique()->numerify('TEST###'),
    ]);
    
    // สร้างสิทธิ์พื้นฐาน
    $this->permissions = [
        'data.view',
        'data.create', 
        'data.update',
        'data.delete'
    ];
    
    foreach ($this->permissions as $permission) {
        Permission::create(['name' => $permission]);
    }
    
    // ล็อกอินด้วยผู้ใช้หลัก
    $this->actingAs($this->user);
});

describe('Permission Page Access', function () {
    
    test('สามารถเข้าถึงหน้า permission ได้เมื่อล็อกอินแล้ว', function () {
        $response = $this->get(route('permission'));
        
        $response->assertStatus(200)
                ->assertInertia(fn (Assert $page) => $page
                    ->component('settings/permission/Permission')
                );
    });
    
    test('ถูกส่งไปหน้า login เมื่อยังไม่ได้ล็อกอิน', function () {
        auth()->logout();
        
        $response = $this->get(route('permission'));
        
        $response->assertRedirect(route('login'));
    });
    
    test('แสดง component ที่ถูกต้อง', function () {
        $response = $this->get(route('permission'));
        
        $response->assertInertia(fn (Assert $page) => $page
            ->component('settings/permission/Permission')
            ->has('users')
        );
    });
});

describe('Permission Data Display', function () {
    
    test('แสดงข้อมูลผู้ใช้และสิทธิ์ทั้งหมดอย่างถูกต้อง', function () {
        // ให้สิทธิ์บางอย่างกับผู้ใช้
        $this->user->givePermissionTo(['data.view', 'data.create']);
        
        $response = $this->get(route('permission'));
        
        $response->assertInertia(fn (Assert $page) => $page
            ->component('settings/permission/Permission')
            ->has('users', function (Assert $page) {
                // ค้นหา user ที่ต้องการทดสอบโดยไม่สนใจ index
                $page->where('0.id', $this->user->id)
                     ->where('0.egat_id', $this->user->egat_id)
                     ->where('0.name', $this->user->name)
                     ->where('0.view', true)
                     ->where('0.create', true)
                     ->where('0.update', false)
                     ->where('0.delete', false)
                     ->etc(); // ยอมรับ properties อื่นที่ไม่ได้ระบุ
            })
        );
    });
    
    test('แสดงข้อมูลผู้ใช้หลายคนอย่างถูกต้อง', function () {
        $allUsers = collect([$this->user])->merge($this->users);
        $totalUsers = $allUsers->count();
        
        $response = $this->get(route('permission'));
        
        $response->assertInertia(fn (Assert $page) => $page
            ->component('settings/permission/Permission')
            ->has('users', $totalUsers) // ตรวจสอบจำนวนที่ถูกต้อง
            ->has('users.0.id')
            ->has('users.0.egat_id')
            ->has('users.0.name')
            ->has('users.0.view')
            ->has('users.0.create')
            ->has('users.0.update')
            ->has('users.0.delete')
        );
    });
    
    test('แสดงสถานะสิทธิ์เริ่มต้นเป็น false สำหรับผู้ใช้ใหม่', function () {
        // สร้างผู้ใช้ใหม่หลังจาก beforeEach เพื่อให้แน่ใจว่าจะถูกรวมในข้อมูล
        $newUser = User::factory()->create([
            'egat_id' => 'NEW001',
            'name' => 'New Test User',
            'email' => 'newuser@example.com'
        ]);
        
        $response = $this->get(route('permission'));
        
        // ใช้วิธีที่ง่ายกว่าในการตรวจสอบ
        $response->assertInertia(fn (Assert $page) => $page
            ->component('settings/permission/Permission')
            ->has('users', function (Assert $usersPage) use ($newUser) {
                // แปลงข้อมูลเป็น array และค้นหา
                $users = $usersPage->toArray();
                
                // Debug: แสดงข้อมูลผู้ใช้ทั้งหมด
                \Log::info('All users in permission test:', [
                    'total_users' => count($users),
                    'user_ids' => collect($users)->pluck('id')->toArray(),
                    'looking_for_id' => $newUser->id
                ]);
                
                // ค้นหาผู้ใช้ใหม่
                $foundUser = collect($users)->firstWhere('id', $newUser->id);
                
                // ถ้าไม่พบ ให้แสดงข้อมูลเพิ่มเติม
                if (!$foundUser) {
                    \Log::error('User not found in permission data', [
                        'new_user_id' => $newUser->id,
                        'new_user_egat_id' => $newUser->egat_id,
                        'all_egat_ids' => collect($users)->pluck('egat_id')->toArray()
                    ]);
                    
                    // ลองค้นหาด้วย egat_id แทน
                    $foundUser = collect($users)->firstWhere('egat_id', $newUser->egat_id);
                }
                
                expect($foundUser)->not->toBeNull('ไม่พบผู้ใช้ใหม่ในข้อมูลที่ส่งกลับ');
                expect($foundUser['view'])->toBeFalse();
                expect($foundUser['create'])->toBeFalse();
                expect($foundUser['update'])->toBeFalse();
                expect($foundUser['delete'])->toBeFalse();
                
                return true;
            })
        );
    });
});

describe('Permission Update Functionality', function () {
    
    test('สามารถให้สิทธิ์ view ได้สำเร็จ', function () {
        $response = $this->patch(route('permission.update'), [
            'id' => $this->user->id,
            'view' => true
        ]);
        
        $response->assertRedirect();
        
        // ตรวจสอบว่าสิทธิ์ถูกเพิ่มในฐานข้อมูล
        expect($this->user->fresh()->hasPermissionTo('data.view'))->toBeTrue();
    });
    
    test('สามารถถอนสิทธิ์ create ได้สำเร็จ', function () {
        // ให้สิทธิ์ก่อน
        $this->user->givePermissionTo('data.create');
        expect($this->user->hasPermissionTo('data.create'))->toBeTrue();
        
        $response = $this->patch(route('permission.update'), [
            'id' => $this->user->id,
            'create' => false
        ]);
        
        $response->assertRedirect();
        
        // ตรวจสอบว่าสิทธิ์ถูกถอน
        expect($this->user->fresh()->hasPermissionTo('data.create'))->toBeFalse();
    });
    
    test('สามารถอัพเดตหลายสิทธิ์พร้อมกันได้', function () {
        $response = $this->patch(route('permission.update'), [
            'id' => $this->user->id,
            'view' => true,
            'create' => true,
            'update' => false,
            'delete' => true
        ]);
        
        $response->assertRedirect();
        
        $user = $this->user->fresh();
        expect($user->hasPermissionTo('data.view'))->toBeTrue();
        expect($user->hasPermissionTo('data.create'))->toBeTrue();
        expect($user->hasPermissionTo('data.update'))->toBeFalse();
        expect($user->hasPermissionTo('data.delete'))->toBeTrue();
    });
    
    test('แสดงข้อผิดพลาดเมื่อไม่ส่ง user ID', function () {
        $response = $this->patch(route('permission.update'), [
            'view' => true
        ]);
        
        $response->assertStatus(422)
                ->assertJson([
                    'success' => false,
                    'message' => 'User ID is required'
                ]);
    });
    
    test('แสดงข้อผิดพลาดเมื่อส่ง user ID ที่ไม่มีอยู่', function () {
        $response = $this->patch(route('permission.update'), [
            'id' => 99999,
            'view' => true
        ]);
        
        $response->assertStatus(500);
    });
});

describe('Permission Validation', function () {
    
    test('ไม่อัพเดตเมื่อส่งสิทธิ์ที่ไม่ถูกต้อง', function () {
        $initialPermissions = $this->user->permissions->pluck('name')->toArray();
        
        $response = $this->patch(route('permission.update'), [
            'id' => $this->user->id,
            'invalid_permission' => true,
            'view' => true
        ]);
        
        // ตรวจสอบว่ามีเฉพาะ view permission เพิ่มขึ้น
        $user = $this->user->fresh();
        expect($user->hasPermissionTo('data.view'))->toBeTrue();
        expect($user->permissions->count())->toBe(count($initialPermissions) + 1);
    });
    
    test('สร้างสิทธิ์ใหม่หากยังไม่มีในระบบ', function () {
        // ลบสิทธิ์ทั้งหมดออกก่อน
        Permission::truncate();
        
        $response = $this->patch(route('permission.update'), [
            'id' => $this->user->id,
            'view' => true
        ]);
        
        $response->assertRedirect();
        
        // ตรวจสอบว่าสิทธิ์ถูกสร้างและกำหนดให้ผู้ใช้
        expect(Permission::where('name', 'data.view')->exists())->toBeTrue();
        expect($this->user->fresh()->hasPermissionTo('data.view'))->toBeTrue();
    });
});

describe('Permission Logging', function () {
    
    test('บันทึก log เมื่ออัพเดตสิทธิ์สำเร็จ', function () {
        \Log::spy();
        
        $response = $this->patch(route('permission.update'), [
            'id' => $this->user->id,
            'view' => true
        ]);
        
        \Log::shouldHaveReceived('info')
            ->with('เริ่มต้นการอัปเดตสิทธิ์', \Mockery::any())
            ->once();
            
        \Log::shouldHaveReceived('info')
            ->with('การอัปเดตสิทธิ์เสร็จสมบูรณ์', \Mockery::any())
            ->once();
    });
    
    test('บันทึก log เมื่อเกิดข้อผิดพลาด', function () {
        \Log::spy();
        
        $response = $this->patch(route('permission.update'), [
            'id' => 99999, // User ที่ไม่มีอยู่
            'view' => true
        ]);
        
        \Log::shouldHaveReceived('error')
            ->with('เกิดข้อผิดพลาดระหว่างการอัปเดตสิทธิ์', \Mockery::any())
            ->once();
    });
});

describe('Permission API Response', function () {
    
    test('ส่งกลับ success response เมื่ออัพเดตสำเร็จ', function () {
        $response = $this->patch(route('permission.update'), [
            'id' => $this->user->id,
            'view' => true
        ]);
        
        $response->assertRedirect()
                ->assertSessionHas('success', true);
    });
    
    test('ส่งกลับ error response เมื่อเกิดข้อผิดพลาด', function () {
        $response = $this->patch(route('permission.update'), [
            'view' => true // ไม่มี ID
        ]);
        
        $response->assertStatus(422)
                ->assertJson([
                    'success' => false,
                    'message' => 'User ID is required'
                ]);
    });
});

describe('Permission Data Integrity', function () {
    
    test('ตรวจสอบข้อมูลผู้ใช้ใหม่แบบง่ายๆ', function () {
        // นับจำนวนผู้ใช้ก่อนเพิ่ม
        $initialCount = User::count();
        
        // สร้างผู้ใช้ใหม่
        $newUser = User::factory()->create([
            'egat_id' => 'SIMPLE001',
            'name' => 'Simple Test User'
        ]);
        
        // ตรวจสอบว่าผู้ใช้ถูกสร้างแล้ว
        expect(User::count())->toBe($initialCount + 1);
        expect(User::find($newUser->id))->not->toBeNull();
        
        // เรียกหน้า permission
        $response = $this->get(route('permission'));
        
        // ตรวจสอบว่าจำนวนผู้ใช้ในข้อมูลถูกต้อง
        $response->assertInertia(fn (Assert $page) => $page
            ->component('settings/permission/Permission')
            ->has('users', User::count()) // ควรมีจำนวนเท่ากับจำนวนผู้ใช้ทั้งหมด
        );
    });
});
