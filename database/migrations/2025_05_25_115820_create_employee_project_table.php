<?php
// database/migrations/2025_05_25_000004_create_employee_project_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_project', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('role');
            $table->date('joined_at');
            $table->date('left_at')->nullable();
            $table->timestamps();
            
            $table->unique(['employee_id', 'project_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_project');
    }
};
