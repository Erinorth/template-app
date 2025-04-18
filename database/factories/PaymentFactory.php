<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['pending', 'completed', 'failed', 'refunded'];
        
        return [
            'status' => $this->faker->randomElement($statuses),
            'email' => $this->faker->safeEmail(),
            'amount' => $this->faker->randomFloat(2, 10, 1000),
        ];
    }
}
