<?php

use App\Http\Controllers\DataTableController;
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

Route::get('data_table', [DataTableController::class, 'index'])->name('datatable.index');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
