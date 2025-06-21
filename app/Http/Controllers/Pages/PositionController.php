<?php

namespace App\Http\Controllers\Pages;

use App\Models\Position;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class PositionController extends Controller
{
     /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $positions = Position::with(['company', 'department', 'parent'])->get();
        return Inertia::render('positions', [
            'positions' => $positions
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('position/create', array_merge([
        ], self::getPositionFormOptions()));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'estado' => 'boolean',
            'company_id' => 'required|exists:companies,id',
            'department_id' => 'nullable|exists:departments,id',
            'parent_id' => 'nullable|exists:positions,id',
        ]);

        Position::create($validated);

        return redirect()->route('positions.index')->with('success', 'Cargo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Position $position)
    {
        return Inertia::render('positions', [
            'position' => $position
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Position $position)
    {
        return Inertia::render('position/edit', array_merge([
            'position' => $position->load(['company', 'department', 'parent']),
        ], self::getPositionFormOptions($position->id)));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'estado' => 'boolean',
            'company_id' => 'required|exists:companies,id',
            'department_id' => 'nullable|exists:departments,id',
            'parent_id' => 'nullable|exists:positions,id',
        ]);

        $position->update($validated);

        return redirect()->route('positions.index')->with('success', 'Cargo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Position $position)
    {
        $position->delete();

        return redirect()->route('positions.index')
            ->with('success', 'Cargo eliminado exitosamente.');
    }

    /**
     * Duplicate positions
     */
    public function duplicate(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron cargos para duplicar.');
        }

        $positions = Position::whereIn('id', $ids)->get();

        foreach ($positions as $position) {
            $newPosition = $position->replicate();
            $newPosition->nombre = $newPosition->nombre . ' (Copia)';
            $newPosition->descripcion = $newPosition->descripcion . ' (Copia)';
            $newPosition->save();
        }

        return back()->with('success', 'Cargos duplicados exitosamente.');
    }

    /**
     * Bulk delete positions
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron cargos para eliminar.');
        }

        Position::whereIn('id', $ids)->delete();

        return back()->with('success', 'Cargos eliminados exitosamente.');
    }

    public static function getPositionFormOptions($excludeId = null)
    {
        $companies = \App\Models\Company::select('id', 'razon_social')->get();
        $departments = \App\Models\Department::select('id', 'nombre')->get();
        $parentsQuery = Position::select('id', 'nombre');
        if ($excludeId) {
            $parentsQuery->where('id', '!=', $excludeId);
        }
        $parents = $parentsQuery->get();

        return [
            'companies' => $companies,
            'departments' => $departments,
            'parents' => $parents,
        ];
    }
}
