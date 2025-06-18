<?php

namespace App\Http\Controllers\Pages;

use App\Models\Shift;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShiftController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $shifts = Shift::with(['createdBy', 'users'])->get()->map(function ($shift) {
            return [
                'id' => $shift->id,
                'nombre' => $shift->nombre,
                'hora_inicio' => $shift->hora_inicio,
                'hora_fin' => $shift->hora_fin,
                'estado' => $shift->estado,
                'creado_por' => $shift->creado_por,
                'created_at' => $shift->created_at,
                'updated_at' => $shift->updated_at,
                'createdBy' => $shift->createdBy ? [
                    'id' => $shift->createdBy->id,
                    'name' => $shift->createdBy->name
                ] : null,
                'created_by' => $shift->createdBy ? [
                    'id' => $shift->createdBy->id,
                    'name' => $shift->createdBy->name
                ] : null,
                'users' => $shift->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name
                    ];
                })->toArray(),
            ];
        });
    
        return Inertia::render('shifts', [
            'shifts' => $shifts
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('shifts/create', array_merge([
        ], self::getShiftFormOptions()));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i',
            'estado' => 'boolean',
            'creado_por' => 'required|exists:users,id',
        ]);

        Shift::create($validated);

        return redirect()->route('shifts.index')->with('success', 'Turno creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Shift $shift)
    {
        return Inertia::render('shifts/show', [
            'shift' => $shift
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Shift $shift)
    {
        return Inertia::render('shifts/edit', array_merge([
            'shift' => $shift->load(['users']),
        ], self::getShiftFormOptions($shift->id)));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i',
            'estado' => 'boolean',
            'creado_por' => 'required|exists:users,id',
        ]);

        $shift->update($validated);

        return redirect()->route('shifts.index')->with('success', 'Turno actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Shift $shift)
    {
        $shift->delete();

        return redirect()->route('shifts.index')
            ->with('success', 'Turno eliminado exitosamente.');
    }

    /**
     * Duplicate shifts
     */
    public function duplicate(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron turnos para duplicar.');
        }

        $shifts = Shift::whereIn('id', $ids)->get();

        foreach ($shifts as $shift) {
            $newShift = $shift->replicate();
            $newShift->creado_por = auth()->user()->id;
            $newShift->estado = true;
            $newShift->save();
        }

        return back()->with('success', 'Turnos duplicados exitosamente.');
    }

    /**
     * Bulk delete shifts
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron turnos para eliminar.');
        }

        Shift::whereIn('id', $ids)->delete();

        return back()->with('success', 'Turnos eliminados exitosamente.');
    }

    public static function getShiftFormOptions($excludeId = null)
    {
        $users = User::select('id', 'name')->get();

        return [
            'users' => $users,
        ];
    }
}
