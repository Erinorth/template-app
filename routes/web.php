<?php

use App\Http\Controllers\DataTableController;
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

    Route::get('payment', [PaymentController::class, 'index'])
        ->name('payment.index');

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
