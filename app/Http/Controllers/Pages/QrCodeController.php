<?php

namespace App\Http\Controllers\Pages;

use App\Models\QrCode;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class QrCodeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $qrCode = QrCode::first();
        return Inertia::render('qr-codes', [
            'qrCode' => $qrCode
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('qr-codes/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'qr_code' => 'required|string|max:255',
        ]);

        $qr = QrCode::first();
        if ($qr) {
            $qr->update($validated);
            $message = 'Código QR actualizado correctamente.';
        } else {
            QrCode::create($validated);
            $message = 'Código QR creado correctamente.';
        }

        return redirect()->route('qr-codes')->with('success', $message);
    }

    /**
     * Display the specified resource.
     */
    public function show(QrCode $qrCode)
    {
        return Inertia::render('qr-codes/show', [
            'qrCode' => $qrCode
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(QrCode $qrCode)
    {
        return Inertia::render('qr-codes/edit', [
            'qrCode' => $qrCode
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, QrCode $qrCode)
    {
        $validated = $request->validate([
            'qr_code' => 'required|string|max:255',
        ]);

        $qrCode->update($validated);

        return redirect()->route('qr-codes')->with('success', 'Código QR actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(QrCode $qrCode)
    {
        $qrCode->delete();

        return redirect()->route('qr-codes.index')
            ->with('success', 'Código QR eliminado exitosamente.');
    }

    /**
     * Duplicate qr codes
     */
    public function duplicate(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron códigos QR para duplicar.');
        }

        $qrCodes = QrCode::whereIn('id', $ids)->get();

        foreach ($qrCodes as $qrCode) {
            $newQrCode = $qrCode->replicate();
            $newQrCode->qr_code = $qrCode->qr_code . ' (Copia)';
            $newQrCode->save();
        }

        return back()->with('success', 'Códigos QR duplicados exitosamente.');
    }

    /**
     * Bulk delete qr codes
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron códigos QR para eliminar.');
        }

        QrCode::whereIn('id', $ids)->delete();

        return back()->with('success', 'Códigos QR eliminados exitosamente.');
    }
} 