<?php
// database/migrations/2025_05_25_000001_create_employees_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('avatar')->nullable();
            
            // Employment Details
            $table->string('department');
            $table->string('position');
            $table->decimal('salary', 10, 2);
            $table->enum('currency', ['THB', 'USD', 'EUR'])->default('THB');
            $table->date('hire_date');
            $table->enum('employment_type', ['Full-time', 'Part-time', 'Contract', 'Intern']);
            
            // Status & Performance
            $table->enum('status', ['Active', 'On Leave', 'Terminated', 'Pending'])->default('Active');
            $table->boolean('is_remote')->default(false);
            $table->decimal('performance_rating', 2, 1)->default(0);
            $table->date('last_review_date')->nullable();
            
            // Skills (JSON)
            $table->json('skills')->nullable();
            
            // Grouping & Aggregation Data
            $table->string('region');
            $table->string('cost_center');
            $table->foreignId('manager_id')->nullable()->constrained('employees')->onDelete('set null');
            
            // Additional Fields
            $table->integer('age');
            $table->integer('experience');
            $table->decimal('bonus', 8, 2)->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['department', 'status']);
            $table->index(['region', 'cost_center']);
            $table->index('hire_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
