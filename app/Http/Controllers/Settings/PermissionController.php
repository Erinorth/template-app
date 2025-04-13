<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;
use App\Models\User;

class PermissionController extends Controller
{
    /* public function __construct()
    {
        $this->middleware('auth'); // Middleware สำหรับตรวจสอบการเข้าสู่ระบบ
    } */

    public function edit(Request $request): Response
    {
        // ดึงข้อมูลผู้ใช้งานทั้งหมดพร้อมแบ่งหน้า (pagination)
        $users = User::all();

        return Inertia::render('settings/Permission', [
            'users' => $users, // ส่งข้อมูล users ไปยัง Vue Component
        ]);
    }
}