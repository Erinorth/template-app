<?php
// database/factories/EmergencyContactFactory.php

namespace Database\Factories;

use App\Models\EmergencyContact;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmergencyContactFactory extends Factory
{
    protected $model = EmergencyContact::class;

    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'name' => $this->faker->name(),
            'relationship' => $this->faker->randomElement(['Spouse', 'Parent', 'Sibling', 'Child', 'Friend']),
            'phone' => $this->faker->phoneNumber(),
            'email' => $this->faker->safeEmail(),
        ];
    }
}
