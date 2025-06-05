<?php

namespace Database\Seeders;

use App\Models\Payment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

/**
 * Seeder สำหรับสร้างข้อมูล Payment ตัวอย่าง
 */
class PaymentSeeder extends Seeder
{
    /**
     * สร้างข้อมูล payments ตัวอย่าง
     */
    public function run(): void
    {
        Log::info('เริ่มสร้างข้อมูล Payment');

        // ข้อมูลตัวอย่างจากภาพ
        $payments = [
            [
                'payment_id' => '#728ed52f',
                'status' => 'success',
                'amount' => 100.00,
                'currency' => 'USD',
                'email' => 'm@example.com',
                'payment_date' => now()->subDays(1),
            ],
            [
                'payment_id' => '#489e1d42',
                'status' => 'success',
                'amount' => 125.00,
                'currency' => 'USD',
                'email' => 'example@gmail.com',
                'payment_date' => now()->subDays(2),
            ],
            [
                'payment_id' => '#629a2f5c',
                'status' => 'success',
                'amount' => 75.00,
                'currency' => 'USD',
                'email' => 'test@example.com',
                'payment_date' => now()->subDays(3),
            ],
            [
                'payment_id' => '#456def78',
                'status' => 'success',
                'amount' => 150.00,
                'currency' => 'USD',
                'email' => 'user2@example.com',
                'payment_date' => now()->subDays(4),
            ],
            [
                'payment_id' => '#345mno67',
                'status' => 'success',
                'amount' => 175.00,
                'currency' => 'USD',
                'email' => 'user5@example.com',
                'payment_date' => now()->subDays(5),
            ],
            [
                'payment_id' => '#234vwx56',
                'status' => 'success',
                'amount' => 180.00,
                'currency' => 'USD',
                'email' => 'user8@example.com',
                'payment_date' => now()->subDays(6),
            ],
            [
                'payment_id' => '#123abc45',
                'status' => 'pending',
                'amount' => 200.00,
                'currency' => 'USD',
                'email' => 'user1@example.com',
                'payment_date' => now(),
            ],
            [
                'payment_id' => '#abc123',
                'status' => 'pending',
                'amount' => 50.00,
                'currency' => 'USD',
                'email' => 'm@example.com',
                'payment_date' => now()->subHour(),
            ],
            [
                'payment_id' => '#789ghi91',
                'status' => 'cancelled',
                'amount' => 85.00,
                'currency' => 'USD',
                'email' => 'user3@example.com',
                'payment_date' => now()->subDays(10),
            ],
            [
                'payment_id' => '#678pqr90',
                'status' => 'cancelled',
                'amount' => 95.00,
                'currency' => 'USD',
                'email' => 'user6@example.com',
                'payment_date' => now()->subDays(12),
            ],
        ];

        // สร้างข้อมูลตัวอย่างจากภาพ
        foreach ($payments as $paymentData) {
            Payment::create($paymentData);
            Log::info("สร้าง Payment: {$paymentData['payment_id']}");
        }

        // สร้างข้อมูลเพิ่มเติมด้วย Factory
        Payment::factory(20)->success()->create();
        Payment::factory(10)->pending()->create();
        Payment::factory(5)->cancelled()->create();

        Log::info('สร้างข้อมูล Payment เสร็จสิ้น รวม: ' . Payment::count() . ' รายการ');
    }
}
