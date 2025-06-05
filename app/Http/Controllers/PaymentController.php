<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller สำหรับจัดการ Payment CRUD operations
 */
class PaymentController extends Controller
{
    /**
     * แสดงรายการ payments ทั้งหมด
     */
    public function index(Request $request): Response
    {
        Log::info('แสดงรายการ Payment', ['user_id' => auth()->id()]);

        // ตรวจสอบสิทธิ์การดู
        Gate::authorize('viewAny', Payment::class);

        $query = Payment::query();

        // ค้นหาตาม payment_id หรือ email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('payment_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
            Log::info('ค้นหา Payment', ['search' => $search]);
        }

        // กรองตามสถานะ
        if ($request->filled('status')) {
            $query->where('status', $request->status);
            Log::info('กรองตามสถานะ', ['status' => $request->status]);
        }

        // กรองตามช่วงวันที่
        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->date_to);
        }

        // เรียงลำดับตามวันที่ล่าสุด
        $payments = $query->orderBy('payment_date', 'desc')
                         ->paginate(15)
                         ->withQueryString();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
            'statusOptions' => [
                'success' => 'สำเร็จ',
                'pending' => 'รอดำเนินการ',
                'cancelled' => 'ยกเลิก'
            ]
        ]);
    }

    /**
     * แสดงฟอร์มสร้าง payment ใหม่
     */
    public function create(): Response
    {
        Log::info('แสดงฟอร์มสร้าง Payment ใหม่', ['user_id' => auth()->id()]);
        
        // ตรวจสอบสิทธิ์การสร้าง
        Gate::authorize('create', Payment::class);

        return Inertia::render('Payments/Create');
    }

    /**
     * บันทึก payment ใหม่
     */
    public function store(StorePaymentRequest $request)
    {
        Log::info('เริ่มบันทึก Payment ใหม่', ['data' => $request->validated()]);
        
        // ตรวจสอบสิทธิ์การสร้าง
        Gate::authorize('create', Payment::class);

        try {
            // สร้าง payment_id แบบสุ่ม
            $paymentId = '#' . substr(md5(uniqid()), 0, 8);
            
            $paymentData = array_merge($request->validated(), [
                'payment_id' => $paymentId,
                'payment_date' => now()
            ]);

            $payment = Payment::create($paymentData);

            Log::info('บันทึก Payment สำเร็จ', [
                'payment_id' => $payment->payment_id,
                'user_id' => auth()->id()
            ]);

            return redirect()->route('payments.index')
                           ->with('success', 'สร้างรายการชำระเงินสำเร็จ');

        } catch (\Exception $e) {
            Log::error('เกิดข้อผิดพลาดในการบันทึก Payment', [
                'error' => $e->getMessage(),
                'data' => $request->validated()
            ]);

            return back()->with('error', 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
        }
    }

    /**
     * แสดงรายละเอียด payment
     */
    public function show(Payment $payment): Response
    {
        Log::info('แสดงรายละเอียด Payment', [
            'payment_id' => $payment->payment_id,
            'user_id' => auth()->id()
        ]);

        // ตรวจสอบสิทธิ์การดู
        Gate::authorize('view', $payment);

        return Inertia::render('Payments/Show', [
            'payment' => $payment
        ]);
    }

    /**
     * แสดงฟอร์มแก้ไข payment
     */
    public function edit(Payment $payment): Response
    {
        Log::info('แสดงฟอร์มแก้ไข Payment', [
            'payment_id' => $payment->payment_id,
            'user_id' => auth()->id()
        ]);

        // ตรวจสอบสิทธิ์การแก้ไข
        Gate::authorize('update', $payment);

        return Inertia::render('Payments/Edit', [
            'payment' => $payment
        ]);
    }

    /**
     * อัปเดต payment
     */
    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        Log::info('เริ่มอัปเดต Payment', [
            'payment_id' => $payment->payment_id,
            'data' => $request->validated()
        ]);

        // ตรวจสอบสิทธิ์การแก้ไข
        Gate::authorize('update', $payment);

        try {
            $payment->update($request->validated());

            Log::info('อัปเดต Payment สำเร็จ', [
                'payment_id' => $payment->payment_id,
                'user_id' => auth()->id()
            ]);

            return redirect()->route('payments.index')
                           ->with('success', 'อัปเดตรายการชำระเงินสำเร็จ');

        } catch (\Exception $e) {
            Log::error('เกิดข้อผิดพลาดในการอัปเดต Payment', [
                'payment_id' => $payment->payment_id,
                'error' => $e->getMessage(),
                'data' => $request->validated()
            ]);

            return back()->with('error', 'เกิดข้อผิดพลาดในการอัปเดต กรุณาลองใหม่อีกครั้ง');
        }
    }

    /**
     * ลบ payment
     */
    public function destroy(Payment $payment)
    {
        Log::info('เริ่มลบ Payment', [
            'payment_id' => $payment->payment_id,
            'user_id' => auth()->id()
        ]);

        // ตรวจสอบสิทธิ์การลบ
        Gate::authorize('delete', $payment);

        try {
            $paymentId = $payment->payment_id;
            $payment->delete();

            Log::info('ลบ Payment สำเร็จ', [
                'payment_id' => $paymentId,
                'user_id' => auth()->id()
            ]);

            return redirect()->route('payments.index')
                           ->with('success', 'ลบรายการชำระเงินสำเร็จ');

        } catch (\Exception $e) {
            Log::error('เกิดข้อผิดพลาดในการลบ Payment', [
                'payment_id' => $payment->payment_id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่อีกครั้ง');
        }
    }

    /**
     * เปลี่ยนสถานะ payment
     */
    public function updateStatus(Request $request, Payment $payment)
    {
        $request->validate([
            'status' => 'required|in:success,pending,cancelled'
        ]);

        Log::info('เริ่มเปลี่ยนสถานะ Payment', [
            'payment_id' => $payment->payment_id,
            'old_status' => $payment->status,
            'new_status' => $request->status
        ]);

        // ตรวจสอบสิทธิ์การแก้ไข
        Gate::authorize('update', $payment);

        try {
            $payment->update(['status' => $request->status]);

            Log::info('เปลี่ยนสถานะ Payment สำเร็จ', [
                'payment_id' => $payment->payment_id,
                'new_status' => $request->status
            ]);

            return back()->with('success', 'เปลี่ยนสถานะสำเร็จ');

        } catch (\Exception $e) {
            Log::error('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ Payment', [
                'payment_id' => $payment->payment_id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
        }
    }
}
