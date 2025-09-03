<?php

namespace Database\Seeders;

use App\Models\CitizenCard;
use App\Models\CitizenCardAttachment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Seeder สำหรับตาราง citizen_card_attachments
 * - หน้าที่เดียว: สร้างไฟล์แนบให้กับบัตรประชาชน
 */
class CitizenCardAttachmentSeeder extends Seeder
{
    public function run(): void
    {
        Log::info('[CitizenCardAttachmentSeeder] เริ่มต้น seeding citizen_card_attachments');

        DB::transaction(function () {
            CitizenCard::query()
                ->select('id')
                ->orderBy('id')
                ->chunk(200, function ($cards) {
                    foreach ($cards as $card) {
                        $attachments = random_int(1, 3);

                        CitizenCardAttachment::factory()
                            ->count($attachments)
                            ->for($card, 'card')
                            ->create();

                        Log::info('[CitizenCardAttachmentSeeder] สร้างไฟล์แนบแล้ว', [
                            'card_id'     => $card->id,
                            'attachments' => $attachments,
                        ]);
                    }
                });
        });

        $this->command?->info('CitizenCardAttachmentSeeder: สร้าง citizen_card_attachments เสร็จสิ้น');
    }
}
