<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // ใช้ softDeletes ตาม migration
use Illuminate\Database\Eloquent\Factories\HasFactory; // ใช้ HasFactory ให้รองรับ factory()

class Citizen extends Model
{
    use HasFactory, SoftDeletes;

    // อธิบาย: อนุญาตให้กรอกฟิลด์ตาม migration เพื่อยึดข้อมูลเป็นหลัก
    protected $fillable = [
        'citizen_id',
        'birth_date',
        'remark',
    ];

    // อธิบาย: สัมพันธ์กับบัตรประชาชน (1 คน มีได้หลายบัตร)
    public function cards()
    {
        return $this->hasMany(CitizenCard::class);
    }
}
