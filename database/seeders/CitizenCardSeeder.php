<?php

namespace Database\Seeders;

use App\Models\Citizen;
use App\Models\CitizenCard;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Seeder สำหรับตาราง citizen_cards
 * - หน้าที่เดียว: สร้างบัตรให้กับ citizen ที่มีอยู่
 */
class CitizenCardSeeder extends Seeder
{
    public function run(): void
    {
        Log::info('[CitizenCardSeeder] เริ่มต้น seeding citizen_cards');

        DB::transaction(function () {
            // สำหรับแต่ละ citizen ให้สร้างบัตร 1-2 ใบ โดยสุ่มมีบัตรหมดอายุบางส่วน
            Citizen::query()
                ->select('id')
                ->orderBy('id')
                ->chunk(200, function ($citizens) {
                    foreach ($citizens as $citizen) {
                        $cardsToMake = random_int(1, 2);

                        for ($i = 0; $i < $cardsToMake; $i++) {
                            $factory = CitizenCard::factory()->for($citizen);
                            if (random_int(0, 100) < 30) {
                                $factory = $factory->expired(); // สุ่ม 30% เป็นบัตรหมดอายุ
                            }

                            $card = $factory->create();

                            Log::info('[CitizenCardSeeder] สร้างบัตรแล้ว', [
                                'citizen_id' => $citizen->id,
                                'card_id'    => $card->id,
                            ]);
                        }
                    }
                });
        });

        $this->command?->info('CitizenCardSeeder: สร้าง citizen_cards เสร็จสิ้น');
    }
}
