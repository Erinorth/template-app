<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory สำหรับสร้างข้อมูล Payment ทดสอบ
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    /**
     * กำหนดรูปแบบข้อมูลเริ่มต้น
     */
    public function definition(): array
    {
        // สร้าง payment_id แบบสุ่ม เช่น #728ed52f
        $paymentId = '#' . substr(md5(uniqid()), 0, 8);
        
        return [
            'payment_id' => $paymentId,
            'status' => $this->faker->randomElement(['success', 'pending', 'cancelled']),
            'amount' => $this->faker->randomFloat(2, 50, 2000), // จำนวนเงิน 50-2000 USD
            'currency' => 'USD',
            'email' => $this->faker->safeEmail(),
            'payment_date' => $this->faker->dateTimeBetween('-30 days', 'now'),
        ];
    }

    /**
     * สร้างข้อมูลสถานะสำเร็จ
     */
    public function success(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'success',
                'payment_date' => $this->faker->dateTimeBetween('-7 days', 'now'),
            ];
        });
    }

    /**
     * สร้างข้อมูลสถานะรอดำเนินการ
     */
    public function pending(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'payment_date' => now(),
            ];
        });
    }

    /**
     * สร้างข้อมูลสถานะยกเลิก
     */
    public function cancelled(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'cancelled',
                'payment_date' => $this->faker->dateTimeBetween('-15 days', '-5 days'),
            ];
        });
    }
}
