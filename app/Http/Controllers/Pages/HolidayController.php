<?php

namespace App\Http\Controllers\Pages;

use App\Models\Holiday;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class HolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $holidays = Holiday::all();
        return Inertia::render('holidays', [
            'holidays' => $holidays
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('holidays/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:255',
            'recurrente' => 'boolean',
            'estado' => 'boolean',
        ]);

        Holiday::create($validated);

        return redirect()->route('holidays.index')->with('success', 'Feriado creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Holiday $holiday)
    {
        return Inertia::render('holidays/show', [
            'holiday' => $holiday
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Holiday $holiday)
    {
        return Inertia::render('holidays/edit', [
            'holiday' => $holiday
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:255',
            'recurrente' => 'boolean',
            'estado' => 'boolean',
        ]);

        $holiday->update($validated);

        return redirect()->route('holidays.index')->with('success', 'Feriado actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Holiday $holiday)
    {
        $holiday->delete();

        return redirect()->route('holidays.index')
            ->with('success', 'Feriado eliminado exitosamente.');
    }

    /**
     * Duplicate companies
     */
    public function duplicate(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron feriados para duplicar.');
        }

        $holidays = Holiday::whereIn('id', $ids)->get();

        foreach ($holidays as $holiday) {
            $newHoliday = $holiday->replicate();
            $newHoliday->save();
        }

        return back()->with('success', 'Feriados duplicados exitosamente.');
    }

    /**
     * Bulk delete companies
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron compañías para eliminar.');
        }

        Company::whereIn('id', $ids)->delete();

        return back()->with('success', 'Compañías eliminadas exitosamente.');
    }
}
