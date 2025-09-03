<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // รองรับ softDeletes
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CitizenCard extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'citizen_id',
        'name',
        'surname',
        'expired_at',
        'remark',
    ];

    // อธิบาย: บัตรประชาชนเป็นของ citizen หนึ่งคน
    public function citizen()
    {
        return $this->belongsTo(Citizen::class);
    }

    // อธิบาย: ไฟล์แนบหลายไฟล์ต่อบัตร
    public function attachments()
    {
        return $this->hasMany(CitizenCardAttachment::class);
    }
}
