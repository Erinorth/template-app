<?php

namespace Database\Seeders;

use App\Models\Citizen;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Seeder สำหรับตาราง citizens
 * - หน้าที่เดียว: สร้างข้อมูลประชาชน
 */
class CitizenSeeder extends Seeder
{
    public function run(): void
    {
        Log::info('[CitizenSeeder] เริ่มต้น seeding citizens');

        DB::transaction(function () {
            // จำนวนที่ต้องการสร้าง สามารถปรับได้ตามสภาพแวดล้อม
            $count = (int) env('SEED_CITIZEN_COUNT', 50);

            Citizen::factory()
                ->count($count)
                ->create();

            Log::info('[CitizenSeeder] สร้าง citizens แล้ว', ['count' => $count]);
        });

        $this->command?->info('CitizenSeeder: สร้าง citizens เสร็จสิ้น');
    }
}
