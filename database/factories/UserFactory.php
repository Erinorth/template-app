<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Factory สำหรับสร้างข้อมูลผู้ใช้จำลอง
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password = null;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // ข้อมูลพื้นฐานผู้ใช้
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            
            // ข้อมูลโปรไฟล์เพิ่มเติม
            'egat_id' => fake()->unique()->numerify('######'), // ตัวเลข 6 ตัวในรูปแบบ string
            'company' => fake()->randomElement([
                'การไฟฟ้าฝ่ายผลิตแห่งประเทศไทย', 
                'EGAT International Co., Ltd.',
                'EGAT Engineering & Service Co., Ltd.'
            ]),
            'department' => fake()->randomElement([
                'แผนกวิศวกรรม',
                'แผนกบัญชีและการเงิน', 
                'แผนกทรัพยากรบุคคล',
                'แผนกเทคโนโลยีสารสนเทศ',
                'แผนกจัดซื้อ',
                'แผนกกฎหมาย'
            ]),
            'position' => fake()->randomElement([
                'วิศวกร',
                'นักวิชาการ',
                'ผู้จัดการ',
                'หัวหน้าแผนก',
                'นักบัญชี',
                'ผู้เชี่ยวชาญ'
            ]),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * สร้างผู้ใช้ที่มี role เฉพาะ
     */
    public function withRole(string $roleName): static
    {
        return $this->afterCreating(function ($user) use ($roleName) {
            $user->assignRole($roleName);
        });
    }
}
