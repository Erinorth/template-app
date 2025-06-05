<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * สร้างตาราง payments
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_id', 50)->unique()->comment('รหัสการชำระเงิน เช่น #728ed52f');
            $table->enum('status', ['success', 'pending', 'cancelled'])->default('pending')->comment('สถานะการชำระเงิน');
            $table->decimal('amount', 10, 2)->comment('จำนวนเงินเป็น USD');
            $table->string('currency', 3)->default('USD')->comment('สกุลเงิน');
            $table->string('email')->comment('อีเมลผู้ชำระเงิน');
            $table->timestamp('payment_date')->comment('วันที่ชำระเงิน');
            $table->timestamps();
            
            // เพิ่ม index สำหรับการค้นหา
            $table->index(['status', 'payment_date']);
            $table->index('email');
        });
    }

    /**
     * ลบตาราง payments
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
