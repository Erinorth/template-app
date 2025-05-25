<?php
// database/seeders/EmployeeSeeder.php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Certification;
use App\Models\Project;
use App\Models\EmergencyContact;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        // รีเซ็ต unique() เพื่อป้องกัน error
        $this->command->info('Creating managers...');
        
        // สร้าง Managers ก่อน
        $managers = Employee::factory(10)->create([
            'position' => 'Manager',
            'manager_id' => null,
        ]);

        $this->command->info('Creating employees...');
        
        // สร้าง Employees ปกติ
        Employee::factory(200)->create([
            'manager_id' => fn() => $managers->random()->id,
        ])->each(function ($employee) {
            // สร้าง Emergency Contact
            EmergencyContact::factory()->create([
                'employee_id' => $employee->id,
            ]);

            // สร้าง Certifications (0-3 ต่อคน)
            $certCount = rand(0, 3);
            if ($certCount > 0) {
                Certification::factory($certCount)->create([
                    'employee_id' => $employee->id,
                ]);
            }
        });

        $this->command->info('Creating projects...');
        
        // สร้าง Projects
        $projects = Project::factory(30)->create();
        
        $this->command->info('Assigning employees to projects...');
        
        // Assign employees to projects
        Employee::all()->each(function ($employee) use ($projects) {
            // แต่ละคนได้รับมอบหมาย 0-3 projects
            $projectCount = rand(0, 3);
            if ($projectCount > 0) {
                $assignedProjects = $projects->random($projectCount);
                $roles = ['Developer', 'Analyst', 'Lead', 'Tester', 'Designer', 'QA'];
                
                foreach ($assignedProjects as $project) {
                    $employee->projects()->attach($project->id, [
                        'role' => fake()->randomElement($roles),
                        'joined_at' => fake()->dateTimeBetween('-2 years', 'now'),
                        'left_at' => fake()->optional(0.2)->dateTimeBetween('-1 year', 'now'),
                    ]);
                }
            }
        });

        $this->command->info('Employee seeding completed!');
    }
}
