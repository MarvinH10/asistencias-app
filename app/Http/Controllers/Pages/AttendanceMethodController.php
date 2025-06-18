<?php

namespace App\Http\Controllers\Pages;

use App\Models\AttendanceMethod;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AttendanceMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $attendanceMethods = AttendanceMethod::all();
        return Inertia::render('attendance-methods', [
            'attendanceMethods' => $attendanceMethods
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('attendance-methods/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'clave' => 'required|string|max:50|unique:attendance_methods',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'estado' => 'boolean',
        ], [
            'clave.unique' => 'La clave ya está en uso.',
        ]);

        AttendanceMethod::create($validated);

        return redirect()->route('attendance-methods.index')->with('success', 'Método de marcado creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AttendanceMethod $attendanceMethod)
    {
        return Inertia::render('attendance-methods/show', [
            'attendanceMethod' => $attendanceMethod
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AttendanceMethod $attendanceMethod)
    {
        return Inertia::render('attendance-methods/edit', [
            'attendanceMethod' => $attendanceMethod
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AttendanceMethod $attendanceMethod)
    {
        $validated = $request->validate([
            'clave' => 'required|string|max:50|unique:attendance_methods,clave,' . $attendanceMethod->id,
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:255',
            'estado' => 'boolean',
        ], [
            'clave.unique' => 'La clave ya está en uso.',
        ]);

        $attendanceMethod->update($validated);

        return redirect()->route('attendance-methods.index')->with('success', 'Método de marcado actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AttendanceMethod $attendanceMethod)
    {
        $attendanceMethod->delete();

        return redirect()->route('attendance-methods.index')
            ->with('success', 'Método de marcado eliminado exitosamente.');
    }

    /**
     * Duplicate attendance methods
     */
    public function duplicate(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron métodos de marcado para duplicar.');
        }

        $attendanceMethods = AttendanceMethod::whereIn('id', $ids)->get();

        foreach ($attendanceMethods as $attendanceMethod) {
            $newAttendanceMethod = $attendanceMethod->replicate();
            $newAttendanceMethod->clave = $newAttendanceMethod->clave . '_copy_' . time();
            $newAttendanceMethod->nombre = $newAttendanceMethod->nombre . ' (Copia)';
            $newAttendanceMethod->descripcion = $newAttendanceMethod->descripcion ? $newAttendanceMethod->descripcion . ' (Copia)' : null;
            $newAttendanceMethod->save();
        }

        return back()->with('success', 'Compañías duplicadas exitosamente.');
    }

    /**
     * Bulk delete attendance methods
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron métodos de marcado para eliminar.');
        }

        AttendanceMethod::whereIn('id', $ids)->delete();

        return back()->with('success', 'Métodos de marcado eliminados exitosamente.');
    }
}
