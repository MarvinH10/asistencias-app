<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AttendanceController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/scann-attendance', function () {
        return Inertia::render('scanner');
    })->name('scann-attendance');

    Route::post('/scann-attendance/register', [AttendanceController::class, 'register'])
        ->name('scann-attendance.register');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
