<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('citizen_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('citizen_id')->constrained();
            $table->string('name'); // VARCHAR(255)
            $table->string('surname'); // VARCHAR(255)
            $table->date('expired_at'); // วันที่ (DATE)
            $table->text('remark')->nullable(); // TEXT ที่เป็น null ได้
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citizen_cards');
    }
};
