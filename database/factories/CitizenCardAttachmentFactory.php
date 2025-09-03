<?php

namespace Database\Factories;

use App\Models\CitizenCard;
use App\Models\CitizenCardAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Factory สำหรับ CitizenCardAttachment
 * - แยกความรับผิดชอบ: สร้างไฟล์แนบของบัตร
 */
class CitizenCardAttachmentFactory extends Factory
{
    protected $model = CitizenCardAttachment::class;

    public function definition(): array
    {
        $ext = $this->faker->randomElement(['jpg', 'png', 'pdf']);
        $mime = [
            'jpg' => 'image/jpeg',
            'png' => 'image/png',
            'pdf' => 'application/pdf',
        ][$ext];

        $file = 'id-card-' . Str::random(12) . '.' . $ext;

        return [
            // ผูกกับบัตร ถ้าไม่ได้กำหนดจากภายนอก
            'citizen_card_id' => CitizenCard::factory(),
            'file_name'       => $file,
            'file_path'       => 'uploads/citizen_cards/' . $file,
            'file_type'       => $mime,
            'file_size'       => $this->faker->numberBetween(15_000, 2_000_000),
        ];
    }
}
