<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class Payment2Controller extends Controller
{
    /**
     * Display a listing of the resource.
     * แสดงรายการ payments
     */
    public function index(Request $request): Response
    {
        // ดึงข้อมูล payments จากฐานข้อมูล
        $payments = Payment::query()
            ->when($request->search, function ($query, $search) {
                // ค้นหาจาก payment_id หรือ email
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
                // แปลงข้อมูลให้ตรงกับ interface ใน Vue
                return [
                    'id' => $payment->payment_id,
                    'amount' => (float) $payment->amount,
                    'status' => $payment->status,
                    'email' => $payment->email,
                ];
            });

        return Inertia::render('payments2/Index', [
            'payments' => $payments,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     * แสดงฟอร์มสร้าง payment ใหม่
     */
    public function create(): Response
    {
        return Inertia::render('Payments/Create');
    }

    /**
     * Store a newly created resource in storage.
     * บันทึก payment ใหม่
     */
    public function store(Request $request)
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
