<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

/**
 * Seeder หลักสำหรับการสร้างข้อมูลเริ่มต้นของระบบ
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Log::info('เริ่มการ seeding ข้อมูลระบบ');

        // เรียก seeder สำหรับสร้าง roles และ users
        $this->call([
            RoleUserSeeder::class,
            CitizenSeeder::class,
            CitizenCardSeeder::class,
            CitizenCardAttachmentSeeder::class,
        ]);

        Log::info('การ seeding ข้อมูลระบบเสร็จสิ้น');
    }
}
