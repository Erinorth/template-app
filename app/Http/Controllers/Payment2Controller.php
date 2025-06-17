<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class Payment2Controller extends Controller
{
    /**
     * แสดงรายการ Payment พร้อมการค้นหาและกรอง
     */
    public function index(Request $request): Response
    {
        // ดึงข้อมูล payments จากฐานข้อมูล
        $payments = Payment::query()
            ->when($request->search, function ($query, $search) {
                // ค้นหาตาม payment_id และ email
                $query->where('payment_id', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                // กรองตามสถานะ
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                // แปลงข้อมูลให้เหมาะสมกับ frontend
                return [
                    'id' => $payment->payment_id,
                    'amount' => (float) $payment->amount,
                    'status' => $payment->status,
                    'email' => $payment->email,
                    'currency' => $payment->currency ?? 'USD',
                    'payment_date' => $payment->payment_date?->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('payments2/Index', [
            'payments' => $payments,
        ]);
    }

    /**
     * แสดงหน้าสร้าง Payment ใหม่
     */
    public function create(): Response
    {
        return Inertia::render('payments2/Create');
    }

    /**
     * บันทึก Payment ใหม่
     */
    public function store(StorePaymentRequest $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'status' => 'required|in:pending,processing,success,failed',
            'email' => 'required|email',
        ]);

        Payment::create($validated);

        return redirect()->route('payments.index')
            ->with('success', 'Payment created successfully!');
    }

    /**
     * Display the specified resource.
     * แสดงรายละเอียด payment
     */
    public function show(Payment $payment): Response
    {
        return Inertia::render('Payments/Show', [
            'payment' => [
                'id' => $payment->payment_id,
                'amount' => (float) $payment->amount,
                'status' => $payment->status,
                'email' => $payment->email,
            ],
        ]);
    }
}
