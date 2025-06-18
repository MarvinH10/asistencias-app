<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/scann-attendance', function () {
        return Inertia::render('scanner');
    })->name('scann-attendance');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
