<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PageViewController;
use App\Http\Controllers\Pages\QrCodeController;
use App\Http\Middleware\CheckPosition;

/**
 * Definición de páginas disponibles en el sistema
 */
$pages = [
    'dashboard',
    'qr-codes',
    'companies',
    'departments',
    'positions',
    'users',
    'attendance-methods',
    'attendance-records',
    'holidays',
    'shifts',
];

/**
 * Grupo de rutas protegidas por autenticación
 */
Route::middleware(['auth', 'verified', CheckPosition::class])->group(function () use ($pages) {
    foreach ($pages as $page) {
        // Rutas principales (CRUD)
        Route::get($page, [PageViewController::class, 'index'])
            ->name($page);
            
        Route::get("$page/create", [PageViewController::class, 'create'])
            ->name("$page.create");
            
        Route::get("$page/{id}/edit", [PageViewController::class, 'edit'])
            ->name("$page.edit");

        // Operaciones de datos
        Route::post($page, [PageViewController::class, 'store'])
            ->name("$page.store");
            
        Route::put("$page/{id}", [PageViewController::class, 'update'])
            ->name("$page.update");
            
        Route::delete("$page/{id}", [PageViewController::class, 'delete'])
            ->name("$page.delete");

        // Operaciones adicionales
        Route::post("$page/duplicate", [PageViewController::class, 'duplicate'])
            ->name("$page.duplicate");

        // Exportar
        Route::get("$page/export", [PageViewController::class, 'export'])
            ->name("$page.export");
    }

    
    Route::get('qr-codes', [QrCodeController::class, 'index'])->name('qr-codes');
    Route::post('qr-codes', [QrCodeController::class, 'store'])->name('qr-codes.store');
});

