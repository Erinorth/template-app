<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Model สำหรับการชำระเงิน
 */
class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'status',
        'amount',
        'currency',
        'email',
        'payment_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    /**
     * แปลงสถานะเป็นภาษาไทย
     */
    protected function statusLabel(): Attribute
    {
        return Attribute::make(
            get: fn () => match($this->status) {
                'success' => 'สำเร็จ',
                'pending' => 'รอดำเนินการ',
                'cancelled' => 'คำสั่งประวัลผล',
                default => $this->status,
            }
        );
    }

    /**
     * แปลงจำนวนเงินให้แสดงเป็น USD
     */
    protected function formattedAmount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->currency . '$' . number_format($this->amount, 2)
        );
    }

    /**
     * สี badge สำหรับสถานะต่างๆ
     */
    protected function statusColor(): Attribute
    {
        return Attribute::make(
            get: fn () => match($this->status) {
                'success' => 'bg-green-100 text-green-800',
                'pending' => 'bg-yellow-100 text-yellow-800',
                'cancelled' => 'bg-blue-100 text-blue-800',
                default => 'bg-gray-100 text-gray-800',
            }
        );
    }
}
