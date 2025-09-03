<?php

namespace Database\Factories;

use App\Models\Citizen;
use App\Models\CitizenCard;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory สำหรับ CitizenCard
 * - แยกความรับผิดชอบ: สร้างข้อมูลบัตรประชาชน โดยผูกกับ citizen_id
 */
class CitizenCardFactory extends Factory
{
    protected $model = CitizenCard::class;

    public function definition(): array
    {
        return [
            // ผูกกับ Citizen โดยอัตโนมัติหากไม่กำหนด citizen_id มาจากภายนอก
            'citizen_id' => Citizen::factory(),
            'name'       => $this->faker->firstName(),   // VARCHAR(255)
            'surname'    => $this->faker->lastName(),    // VARCHAR(255)
            'expired_at' => $this->faker->dateTimeBetween('now', '+10 years')->format('Y-m-d'), // DATE
            'remark'     => $this->faker->optional()->sentence(),
        ];
    }

    /**
     * สถานะ: บัตรหมดอายุ
     */
    public function expired(): self
    {
        return $this->state(fn () => [
            'expired_at' => $this->faker->dateTimeBetween('-5 years', '-1 day')->format('Y-m-d'),
        ]);
    }
}
