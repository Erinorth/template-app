<?php

namespace Database\Factories;

use App\Models\Citizen;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory สำหรับ Citizen
 * - แยกความรับผิดชอบ: สร้างข้อมูลพลเมืองเท่านั้น
 */
class CitizenFactory extends Factory
{
    protected $model = Citizen::class;

    public function definition(): array
    {
        // ฟังก์ชันช่วยสร้างเลขบัตรประชาชนไทย 13 หลัก (จำลอง)
        $genThaiCitizenId = function (): string {
            // หมายเหตุ: ไม่ได้คำนวณ check digit ตามกฎหมาย เพียงสุ่ม 13 หลักเพื่อใช้ทดสอบ
            $digits = '';
            for ($i = 0; $i < 13; $i++) {
                $digits .= (string) random_int(0, 9);
            }
            return $digits;
        };

        return [
            'citizen_id' => $genThaiCitizenId(),                // VARCHAR(255)
            'birth_date' => $this->faker->dateTimeBetween('-80 years', '-18 years')->format('Y-m-d'), // DATE
            'remark'     => $this->faker->optional()->sentence(),
        ];
    }
}
