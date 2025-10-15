<?php

namespace App\Http\Requests;

use App\Models\Citizen;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

/**
 * Form Request สำหรับการอัปเดตข้อมูลประชาชน
 * ตรวจสอบสิทธิ์ผ่าน Policy และ validation ข้อมูล
 */
class UpdateCitizenRequest extends FormRequest
{
    /**
     * กำหนดว่าผู้ใช้มีสิทธิ์ทำ request นี้หรือไม่
     * ตรวจสอบผ่าน CitizenPolicy->update()
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

        // ดึง Citizen จาก route parameter
        $citizen = $this->route('citizen');
        
        // ตรวจสอบว่ามี citizen หรือไม่
        if (!$citizen instanceof Citizen) {
            Log::warning('Citizen not found in route parameter', [
                'user_id' => $this->user()->id,
                'route_params' => $this->route()->parameters()
            ]);
            return false;
        }

        // ตรวจสอบสิทธิ์ผ่าน Policy
        $canUpdate = $this->user()->can('update', $citizen);
        
        Log::info('UpdateCitizenRequest authorization check', [
            'user_id' => $this->user()->id,
            'citizen_id' => $citizen->id,
            'can_update' => $canUpdate,
            'roles' => $this->user()->getRoleNames()
        ]);

        return $canUpdate;
    }

    /**
     * กำหนด validation rules สำหรับการอัปเดตข้อมูลประชาชน
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // ดึง ID ของ Citizen ที่กำลังแก้ไขจาก route parameter
        $citizenId = $this->route('citizen')->id ?? null;

        return [
            // รหัสบัตรประชาชน: required, ต้องเป็นตัวเลข, ความยาว 13 หลัก
            // ไม่ซ้ำในระบบ ยกเว้นตัวเองที่กำลังแก้ไข
            'citizen_id' => [
                'required',
                'string',
                'digits:13',
                Rule::unique('citizens', 'citizen_id')->ignore($citizenId),
            ],
            
            // วันเกิด: required, ต้องเป็นวันที่ที่ถูกต้อง, ไม่เกินวันปัจจุบัน
            'birth_date' => [
                'required',
                'date',
                'before_or_equal:today',
                'after:1900-01-01',
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
        $citizen = $this->route('citizen');
        
        Log::warning('Failed authorization for updating citizen', [
            'user_id' => auth()->id(),
            'citizen_id' => $citizen?->id,
            'roles' => auth()->user()?->getRoleNames(),
            'ip' => $this->ip()
        ]);

        // ส่ง exception ที่จะแปลงเป็น 403 response
        parent::failedAuthorization();
    }
}
