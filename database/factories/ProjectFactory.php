<?php
// database/factories/ProjectFactory.php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-2 years', '+6 months');
        
        return [
            'name' => $this->faker->catchPhrase() . ' Project',
            'description' => $this->faker->paragraph(),
            'budget' => $this->faker->numberBetween(100000, 5000000),
            'status' => $this->faker->randomElement(['Planning', 'In Progress', 'Completed', 'On Hold']),
            'start_date' => $startDate,
            'end_date' => $this->faker->optional(0.7)->dateTimeBetween($startDate, '+2 years'),
        ];
    }
}
