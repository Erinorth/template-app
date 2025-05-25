<?php
// database/migrations/2025_05_25_000002_create_certifications_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('issuer');
            $table->date('issue_date');
            $table->date('expiry_date')->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamps();
            
            $table->index(['employee_id', 'verified']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certifications');
    }
};
