<?php

namespace App\Http\Requests;

use App\Models\Citizen;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

/**
 * Form Request สำหรับการสร้างข้อมูลประชาชนใหม่
 * ตรวจสอบสิทธิ์ผ่าน Policy และ validation ข้อมูล
 */
class StoreCitizenRequest extends FormRequest
{
    /**
     * กำหนดว่าผู้ใช้มีสิทธิ์ทำ request นี้หรือไม่
     * ตรวจสอบผ่าน CitizenPolicy->create()
     * อนุญาต: super admin, admin เท่านั้น
     */
    public function authorize(): bool
    {
        // ตรวจสอบว่า user login แล้วหรือยัง
        if (!auth()->check()) {
            Log::warning('Unauthorized: User not authenticated', [
                'ip' => $this->ip(),
                'url' => $this->fullUrl()
            ]);
            return false;
        }

        // ตรวจสอบสิทธิ์ผ่าน Policy
        $canCreate = $this->user()->can('create', Citizen::class);
        
        Log::info('StoreCitizenRequest authorization check', [
            'user_id' => $this->user()->id,
            'can_create' => $canCreate,
            'roles' => $this->user()->getRoleNames()
        ]);

        return $canCreate;
    }

    /**
     * กำหนด validation rules สำหรับการสร้างข้อมูลประชาชน
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // รหัสบัตรประชาชน: required, ต้องเป็นตัวเลข, ความยาว 13 หลัก, ไม่ซ้ำในระบบ
            'citizen_id' => [
                'required',
                'string',
                'digits:13',
                'unique:citizens,citizen_id',
                // ถ้าต้องการตรวจสอบรูปแบบบัตรประชาชนไทยที่ถูกต้อง สามารถใช้ package เพิ่มเติม
                // เช่น: new \Farzai\ThaiIdValidation\Laravel\Rules\IdCard
            ],
            
            // วันเกิด: required, ต้องเป็นวันที่ที่ถูกต้อง, ไม่เกินวันปัจจุบัน
            'birth_date' => [
                'required',
                'date',
                'before_or_equal:today',
                'after:1900-01-01', // ตรวจสอบว่าไม่ใช่วันที่ย้อนหลังเกินไป
            ],
            
            // หมายเหตุ: optional, เป็น string, ความยาวไม่เกิน 500 ตัวอักษร
            'remark' => [
                'nullable',
                'string',
                'max:500',
            ],
        ];
    }

    /**
     * กำหนดข้อความ error ที่กำหนดเองสำหรับ validation
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'citizen_id.required' => 'กรุณากรอกรหัสบัตรประชาชน',
            'citizen_id.digits' => 'รหัสบัตรประชาชนต้องมีความยาว 13 หลัก',
            'citizen_id.unique' => 'รหัสบัตรประชาชนนี้มีอยู่ในระบบแล้ว',
            
            'birth_date.required' => 'กรุณาเลือกวันเกิด',
            'birth_date.date' => 'รูปแบบวันที่ไม่ถูกต้อง',
            'birth_date.before_or_equal' => 'วันเกิดต้องไม่เกินวันปัจจุบัน',
            'birth_date.after' => 'วันเกิดไม่ถูกต้อง',
            
            'remark.max' => 'หมายเหตุต้องมีความยาวไม่เกิน 500 ตัวอักษร',
        ];
    }

    /**
     * กำหนดชื่อที่แสดงสำหรับ field ต่างๆ
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'citizen_id' => 'รหัสบัตรประชาชน',
            'birth_date' => 'วันเกิด',
            'remark' => 'หมายเหตุ',
        ];
    }

    /**
     * จัดการ response เมื่อ authorization ล้มเหลว
     */
    protected function failedAuthorization()
    {
        Log::warning('Failed authorization for creating citizen', [
            'user_id' => auth()->id(),
            'roles' => auth()->user()?->getRoleNames(),
            'ip' => $this->ip()
        ]);

        // ส่ง exception ที่จะแปลงเป็น 403 response
        parent::failedAuthorization();
    }
}
