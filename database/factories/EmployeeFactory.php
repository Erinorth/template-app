<?php
// database/factories/EmployeeFactory.php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

    public function definition(): array
    {
        $departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
        $positions = [
            'Engineering' => ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Engineering Manager'],
            'Marketing' => ['Marketing Specialist', 'Marketing Manager', 'Digital Marketing Lead'],
            'Sales' => ['Sales Representative', 'Sales Manager', 'Account Executive'],
            'HR' => ['HR Specialist', 'HR Manager', 'Recruiter'],
            'Finance' => ['Financial Analyst', 'Accountant', 'Finance Manager'],
            'Operations' => ['Operations Specialist', 'Operations Manager', 'Project Manager']
        ];
        
        $department = $this->faker->randomElement($departments);
        
        // เพิ่ม skills ให้มากขึ้น
        $skills = [
            'Engineering' => [
                'React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 
                'Python', 'Java', 'PHP', 'Laravel', 'Vue.js', 'Angular', 
                'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Git', 'CI/CD'
            ],
            'Marketing' => [
                'SEO', 'Google Analytics', 'Facebook Ads', 'Content Writing', 
                'Photoshop', 'Social Media Marketing', 'Email Marketing', 
                'Marketing Automation', 'Brand Management', 'Market Research'
            ],
            'Sales' => [
                'CRM', 'Salesforce', 'Negotiation', 'Lead Generation', 
                'Customer Service', 'Cold Calling', 'Presentation Skills', 
                'Account Management', 'Sales Analytics', 'Pipeline Management'
            ],
            'HR' => [
                'Recruitment', 'Performance Management', 'Training', 
                'Employee Relations', 'Payroll', 'HR Analytics', 
                'Talent Acquisition', 'Onboarding', 'Policy Development'
            ],
            'Finance' => [
                'Excel', 'Financial Analysis', 'Budgeting', 'SAP', 'QuickBooks', 
                'Financial Reporting', 'Tax Planning', 'Risk Management', 
                'Investment Analysis', 'Cost Accounting'
            ],
            'Operations' => [
                'Project Management', 'Process Improvement', 'Supply Chain', 
                'Quality Control', 'Lean Six Sigma', 'Inventory Management', 
                'Vendor Management', 'Operations Analytics', 'Logistics'
            ]
        ];

        $departmentSkills = $skills[$department];
        
        // คำนวณจำนวน skills ที่จะสุ่ม โดยไม่เกิน array size
        $maxSkills = min(5, count($departmentSkills));
        $minSkills = min(2, count($departmentSkills));
        $skillCount = $this->faker->numberBetween($minSkills, $maxSkills);

        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'avatar' => $this->faker->imageUrl(200, 200, 'people'),
            'department' => $department,
            'position' => $this->faker->randomElement($positions[$department]),
            'salary' => $this->faker->numberBetween(30000, 150000),
            'currency' => $this->faker->randomElement(['THB', 'USD', 'EUR']),
            'hire_date' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'employment_type' => $this->faker->randomElement(['Full-time', 'Part-time', 'Contract', 'Intern']),
            'status' => $this->faker->randomElement(['Active', 'On Leave', 'Terminated', 'Pending']),
            'is_remote' => $this->faker->boolean(30),
            'performance_rating' => $this->faker->randomFloat(1, 1, 5),
            'last_review_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'skills' => $this->faker->randomElements($departmentSkills, $skillCount),
            'region' => $this->faker->randomElement(['Bangkok', 'Chiang Mai', 'Phuket', 'Khon Kaen', 'Hat Yai']),
            'cost_center' => strtoupper(substr($department, 0, 3)) . '-' . $this->faker->numberBetween(100, 999),
            'age' => $this->faker->numberBetween(22, 65),
            'experience' => $this->faker->numberBetween(0, 20),
            'bonus' => $this->faker->optional(0.7)->numberBetween(5000, 50000),
            'notes' => $this->faker->optional(0.3)->sentence(),
        ];
    }
}
