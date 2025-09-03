<?php

use App\Http\Controllers\CitizenController;
use App\Http\Controllers\PermissionController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserRole\UserRoleController;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('loginEGAT');
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {

    // Citizen Management Routes
    Route::resource('citizens', CitizenController::class);

    // User Role Management Routes
    Route::prefix('user-roles')->name('user-roles.')->group(function () {
        Route::get('/', [UserRoleController::class, 'index'])->name('index');
        Route::patch('/{user}/update-role', [UserRoleController::class, 'updateRole'])->name('update-role');
        Route::delete('/{user}/remove-role', [UserRoleController::class, 'removeRole'])->name('remove-role');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
