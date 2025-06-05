<?php

use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/* Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home'); */

/* Route::get('/', function () {
    return redirect()->route('login');
})->name('home'); */

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('loginEGAT');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {

    // Route สำหรับแสดง Data Table Demo
    Route::get('/data-table-demo', function () {
        return Inertia::render('data_table_demo/DataTable');
    })->name('data-table.demo');

    Route::resource('payments', PaymentController::class);
    
    // Route เพิ่มเติมสำหรับเปลี่ยนสถานะ
    Route::patch('payments/{payment}/status', [PaymentController::class, 'updateStatus'])
         ->name('payments.update-status');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
