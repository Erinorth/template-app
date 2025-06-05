<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

/**
 * Form Request สำหรับ validation การสร้าง Payment ใหม่
 */
class StorePaymentRequest extends FormRequest
{
    /**
     * ตรวจสอบสิทธิ์ในการทำ request นี้
     */
    public function authorize(): bool
    {
        Log::info('ตรวจสอบสิทธิ์การสร้าง Payment', ['user_id' => auth()->id()]);
        return auth()->check(); // ต้อง login เท่านั้น
    }

    /**
     * กฎการ validation
     */
    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'in:success,pending,cancelled'
            ],
            'amount' => [
                'required',
                'numeric',
                'min:0.01',
                'max:999999.99'
            ],
            'currency' => [
                'required',
                'string',
                'size:3',
                'in:USD,THB,EUR,GBP'
            ],
            'email' => [
                'required',
                'email:rfc,dns',
                'max:255'
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
            'email.max' => 'อีเมลต้องไม่เกิน 255 ตัวอักษร'
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
            'email' => 'อีเมล'
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

        Log::info('เตรียมข้อมูลสำหรับ validation การสร้าง Payment', [
            'prepared_data' => $this->only(['status', 'amount', 'currency', 'email'])
        ]);
    }
}
