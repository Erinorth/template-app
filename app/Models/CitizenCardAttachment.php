<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // รองรับ softDeletes
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CitizenCardAttachment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'citizen_card_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
    ];

    // อธิบาย: ไฟล์แนบเป็นของบัตรหนึ่งใบ
    public function citizenCard()
    {
        return $this->belongsTo(CitizenCard::class);
    }
}
