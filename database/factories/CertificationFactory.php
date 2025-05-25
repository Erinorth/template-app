<?php
// database/factories/CertificationFactory.php

namespace Database\Factories;

use App\Models\Certification;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class CertificationFactory extends Factory
{
    protected $model = Certification::class;

    public function definition(): array
    {
        $certifications = [
            ['name' => 'AWS Solutions Architect', 'issuer' => 'Amazon Web Services'],
            ['name' => 'Google Cloud Professional', 'issuer' => 'Google Cloud'],
            ['name' => 'PMP Certification', 'issuer' => 'Project Management Institute'],
            ['name' => 'Scrum Master', 'issuer' => 'Scrum Alliance'],
            ['name' => 'CPA', 'issuer' => 'AICPA'],
            ['name' => 'SHRM-CP', 'issuer' => 'SHRM'],
        ];

        $cert = $this->faker->randomElement($certifications);
        $issueDate = $this->faker->dateTimeBetween('-3 years', 'now');

        return [
            'employee_id' => Employee::factory(),
            'name' => $cert['name'],
            'issuer' => $cert['issuer'],
            'issue_date' => $issueDate,
            'expiry_date' => $this->faker->optional(0.8)->dateTimeBetween($issueDate, '+3 years'),
            'verified' => $this->faker->boolean(85),
        ];
    }
}
