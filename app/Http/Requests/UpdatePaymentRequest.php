<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

/**
 * Form Request สำหรับ validation การแก้ไข Payment
 */
class UpdatePaymentRequest extends FormRequest
{
    /**
     * ตรวจสอบสิทธิ์ในการทำ request นี้
     */
    public function authorize(): bool
    {
        Log::info('ตรวจสอบสิทธิ์การแก้ไข Payment', [
            'user_id' => auth()->id(),
            'payment_id' => $this->route('payment')?->payment_id
        ]);
        return auth()->check(); // ต้อง login เท่านั้น
    }

    /**
     * กฎการ validation
     */
    public function rules(): array
    {
        return [
            'status' => [
                'sometimes',
                'required',
                'in:success,pending,cancelled'
            ],
            'amount' => [
                'sometimes',
                'required',
                'numeric',
                'min:0.01',
                'max:999999.99'
            ],
            'currency' => [
                'sometimes',
                'required',
                'string',
                'size:3',
                'in:USD,THB,EUR,GBP'
            ],
            'email' => [
                'sometimes',
                'required',
                'email:rfc,dns',
                'max:255'
            ],
            'payment_date' => [
                'sometimes',
                'required',
                'date',
                'before_or_equal:today'
            ]
        ];
    }

    /**
     * ข้อความ error ภาษาไทย
     */
    public function messages(): array
    {
        return [
            'status.required' => 'กรุณาเลือกสถานะการชำระเงิน',
            'status.in' => 'สถานะที่เลือกไม่ถูกต้อง',
            
            'amount.required' => 'กรุณาระบุจำนวนเงิน',
            'amount.numeric' => 'จำนวนเงินต้องเป็นตัวเลขเท่านั้น',
            'amount.min' => 'จำนวนเงินต้องมากกว่า 0.01',
            'amount.max' => 'จำนวนเงินต้องไม่เกิน 999,999.99',
            
            'currency.required' => 'กรุณาเลือกสกุลเงิน',
            'currency.size' => 'สกุลเงินต้องมี 3 ตัวอักษร',
            'currency.in' => 'สกุลเงินที่เลือกไม่รองรับ',
            
            'email.required' => 'กรุณาระบุอีเมล',
            'email.email' => 'รูปแบบอีเมลไม่ถูกต้อง',
            'email.max' => 'อีเมลต้องไม่เกิน 255 ตัวอักษร',
            
            'payment_date.required' => 'กรุณาระบุวันที่ชำระเงิน',
            'payment_date.date' => 'รูปแบบวันที่ไม่ถูกต้อง',
            'payment_date.before_or_equal' => 'วันที่ชำระเงินต้องไม่เกินวันปัจจุบัน'
        ];
    }

    /**
     * ชื่อ attributes สำหรับแสดงใน error message
     */
    public function attributes(): array
    {
        return [
            'status' => 'สถานะ',
            'amount' => 'จำนวนเงิน',
            'currency' => 'สกุลเงิน',
            'email' => 'อีเมล',
            'payment_date' => 'วันที่ชำระเงิน'
        ];
    }

    /**
     * เตรียมข้อมูลก่อน validation
     */
    protected function prepareForValidation(): void
    {
        // แปลงจำนวนเงินให้เป็น float และตัดเศษส่วนที่เกิน 2 ตำแหน่ง
        if ($this->has('amount')) {
            $this->merge([
                'amount' => round((float) $this->amount, 2)
            ]);
        }

        // แปลงสกุลเงินเป็น uppercase
        if ($this->has('currency')) {
            $this->merge([
                'currency' => strtoupper($this->currency)
            ]);
        }

        // แปลงอีเมลเป็น lowercase
        if ($this->has('email')) {
            $this->merge([
                'email' => strtolower(trim($this->email))
            ]);
        }

        Log::info('เตรียมข้อมูลสำหรับ validation การแก้ไข Payment', [
            'payment_id' => $this->route('payment')?->payment_id,
            'prepared_data' => $this->only(['status', 'amount', 'currency', 'email', 'payment_date'])
        ]);
    }
}
