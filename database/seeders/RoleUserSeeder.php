<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Log;

/**
 * Seeder สำหรับสร้าง roles และ users เริ่มต้น
 */
class RoleUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Log::info('เริ่มการสร้าง roles และ users');

        // สร้าง roles หลัก
        $this->createRoles();
        
        // สร้าง users ตัวอย่างสำหรับแต่ละ role
        $this->createUsers();
        
        Log::info('สร้าง roles และ users เสร็จสิ้น');
    }

    /**
     * สร้าง roles หลักของระบบ
     */
    private function createRoles(): void
    {
        $roles = [
            'super admin' => 'ผู้ดูแลระบบสูงสุด - มีสิทธิ์ทุกอย่าง',
            'admin' => 'ผู้ดูแลระบบ - มีสิทธิ์จัดการข้อมูลหลัก',
            'member' => 'ผู้ใช้งานทั่วไป - ใช้งานระบบพื้นฐาน'
        ];

        foreach ($roles as $roleName => $description) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            
            Log::info("สร้าง role: {$roleName}", [
                'role_id' => $role->id,
                'description' => $description
            ]);
        }
    }

    /**
     * สร้าง users ตัวอย่างสำหรับแต่ละ role
     */
    private function createUsers(): void
    {
        // สร้าง Super Admin
        $superAdmin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@egat.co.th',
            'egat_id' => '000001', // ตัวเลข 6 ตัวในรูปแบบ string
            'company' => 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย',
            'department' => 'แผนกเทคโนโลยีสารสนเทศ',
            'position' => 'ผู้จัดการระบบ',
        ]);
        $superAdmin->assignRole('super admin');
        
        Log::info('สร้าง Super Admin', [
            'user_id' => $superAdmin->id,
            'email' => $superAdmin->email,
            'egat_id' => $superAdmin->egat_id
        ]);

        // สร้าง Admin
        $admin = User::factory()->create([
            'name' => 'ผู้ดูแลระบบ',
            'email' => 'admin@egat.co.th',
            'egat_id' => '000002', // ตัวเลข 6 ตัวในรูปแบบ string
            'company' => 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย',
            'department' => 'แผนกเทคโนโลยีสารสนเทศ',
            'position' => 'วิศวกรระบบ',
        ]);
        $admin->assignRole('admin');
        
        Log::info('สร้าง Admin', [
            'user_id' => $admin->id,
            'email' => $admin->email,
            'egat_id' => $admin->egat_id
        ]);

        // สร้าง Member
        $member = User::factory()->create([
            'name' => 'ผู้ใช้งานตัวอย่าง',
            'email' => 'user@egat.co.th',
            'egat_id' => '000003', // ตัวเลข 6 ตัวในรูปแบบ string
            'company' => 'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย',
            'department' => 'แผนกวิศวกรรม',
            'position' => 'วิศวกร',
        ]);
        $member->assignRole('member');
        
        Log::info('สร้าง Member', [
            'user_id' => $member->id,
            'email' => $member->email,
            'egat_id' => $member->egat_id
        ]);

        // สร้าง users เพิ่มเติมด้วย factory (จำนวน 10 คน)
        User::factory(10)
            ->withRole('member')
            ->create();
            
        Log::info('สร้าง users เพิ่มเติม 10 คน ด้วย role member');
    }
}
