<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Policy สำหรับจัดการสิทธิ์การเข้าถึง Payment
 */
class PaymentPolicy
{
    /**
     * ตรวจสอบสิทธิ์การดูรายการ payments ทั้งหมด
     */
    public function viewAny(User $user): bool
    {
        Log::info('ตรวจสอบสิทธิ์การดูรายการ Payment', ['user_id' => $user->id]);
        
        // อนุญาตให้ user ที่ login แล้วดูได้ทั้งหมด
        // หรือสามารถเพิ่มเงื่อนไขตาม role ได้
        return true;
    }

    /**
     * ตรวจสอบสิทธิ์การดู payment รายการเดียว
     */
    public function view(User $user, Payment $payment): bool
    {
        Log::info('ตรวจสอบสิทธิ์การดู Payment', [
            'user_id' => $user->id,
            'payment_id' => $payment->payment_id
        ]);

        // อนุญาตให้ดูได้ทั้งหมด หรือสามารถเพิ่มเงื่อนไข เช่น
        // return $user->email === $payment->email; // ดูได้เฉพาะ payment ของตัวเอง
        return true;
    }

    /**
     * ตรวจสอบสิทธิ์การสร้าง payment ใหม่
     */
    public function create(User $user): bool
    {
        Log::info('ตรวจสอบสิทธิ์การสร้าง Payment', ['user_id' => $user->id]);
        
        // อนุญาตให้ user ที่ login แล้วสร้างได้
        // สามารถเพิ่มเงื่อนไขตาม role เช่น
        // return $user->hasRole('admin') || $user->hasRole('manager');
        return true;
    }

    /**
     * ตรวจสอบสิทธิ์การแก้ไข payment
     */
    public function update(User $user, Payment $payment): bool
    {
        Log::info('ตรวจสอบสิทธิ์การแก้ไข Payment', [
            'user_id' => $user->id,
            'payment_id' => $payment->payment_id,
            'payment_status' => $payment->status
        ]);

        // ตัวอย่างเงื่อนไข: ไม่อนุญาตให้แก้ไข payment ที่สำเร็จแล้ว
        if ($payment->status === 'success') {
            Log::warning('พยายามแก้ไข Payment ที่สำเร็จแล้ว', [
                'user_id' => $user->id,
                'payment_id' => $payment->payment_id
            ]);
            return false;
        }

        // อนุญาตให้แก้ไขได้
        return true;
    }

    /**
     * ตรวจสอบสิทธิ์การลบ payment
     */
    public function delete(User $user, Payment $payment): bool
    {
        Log::info('ตรวจสอบสิทธิ์การลบ Payment', [
            'user_id' => $user->id,
            'payment_id' => $payment->payment_id,
            'payment_status' => $payment->status
        ]);

        // ตัวอย่างเงื่อนไข: ลบได้เฉพาะ payment ที่ยกเลิกหรือรอดำเนินการ
        $allowedStatuses = ['cancelled', 'pending'];
        
        if (!in_array($payment->status, $allowedStatuses)) {
            Log::warning('พยายามลบ Payment ที่ไม่อนุญาต', [
                'user_id' => $user->id,
                'payment_id' => $payment->payment_id,
                'status' => $payment->status
            ]);
            return false;
        }

        // สามารถเพิ่มเงื่อนไขตาม role
        // return $user->hasRole('admin');
        
        return true;
    }

    /**
     * ตรวจสอบสิทธิ์การกู้คืน payment (ถ้าใช้ soft delete)
     */
    public function restore(User $user, Payment $payment): bool
    {
        Log::info('ตรวจสอบสิทธิ์การกู้คืน Payment', [
            'user_id' => $user->id,
            'payment_id' => $payment->payment_id
        ]);

        // อนุญาตเฉพาะ admin
        // return $user->hasRole('admin');
        return true;
    }

    /**
     * ตรวจสอบสิทธิ์การลบถาวร payment
     */
    public function forceDelete(User $user, Payment $payment): bool
    {
        Log::info('ตรวจสอบสิทธิ์การลบถาวร Payment', [
            'user_id' => $user->id,
            'payment_id' => $payment->payment_id
        ]);

        // อนุญาตเฉพาะ super admin
        // return $user->hasRole('super-admin');
        return false; // ไม่อนุญาตให้ลบถาวรโดยทั่วไป
    }
}
