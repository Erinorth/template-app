<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * เพิ่ม column ใหม่ในตาราง users สำหรับข้อมูลโปรไฟล์ผู้ใช้
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // เพิ่ม column ข้อมูลโปรไฟล์ผู้ใช้
            $table->string('egat_id')->nullable()->comment('รหัสพนักงาน EGAT'); 
            $table->string('company')->nullable()->comment('บริษัท/หน่วยงาน');
            $table->string('department')->nullable()->comment('แผนก');
            $table->string('position')->nullable()->comment('ตำแหน่งงาน');
        });
    }

    /**
     * Reverse the migrations.
     * ลบ column ที่เพิ่มเข้าไปในตาราง users
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ลบ column ที่เพิ่มเข้าไป
            $table->dropColumn([
                'egat_id', 
                'company', 
                'department', 
                'position'
            ]);
        });
    }
};
