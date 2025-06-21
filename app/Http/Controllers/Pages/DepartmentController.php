<?php

namespace App\Http\Controllers\Pages;

use App\Models\Department;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Database\QueryException;

class DepartmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $departments = Department::with(['company', 'parent'])->get();
        return Inertia::render('departments', [
            'departments' => $departments
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('departments/create', array_merge([
        ], self::getDepartmentFormOptions()));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:20|unique:departments',
            'direccion' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:255',
            'estado' => 'boolean',
            'parent_id' => 'nullable|exists:departments,id',
            'company_id' => 'required|exists:companies,id',
        ]);

        Department::create($validated);

        return redirect()->route('departments.index')->with('success', 'Departamento creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Department $department)
    {
        return Inertia::render('departments/show', [
            'department' => $department
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Department $department)
    {
        return Inertia::render('departments/edit', array_merge([
            'department' => $department->load(['company', 'parent']),
        ], self::getDepartmentFormOptions($department->id)));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:20|unique:departments,codigo,' . $department->id,
            'direccion' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:255',
            'estado' => 'boolean',
            'parent_id' => 'nullable|exists:departments,id',
            'company_id' => 'required|exists:companies,id',
        ]);

        $department->update($validated);

        return redirect()->route('departments.index')->with('success', 'Departamento actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Department $department)
    {
        $department->delete();

        return redirect()->route('departments.index')
            ->with('success', 'Departamento eliminado exitosamente.');
    }

    /**
     * Duplicate departments
     */
    public function duplicate(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron departamentos para duplicar.');
        }

        $departments = Department::whereIn('id', $ids)->get();

        foreach ($departments as $department) {
            $newDepartment = $department->replicate();

            $baseCodigo = $department->codigo;
            $newCodigo = $baseCodigo . '_copy';
            $counter = 1;

            while (Department::where('codigo', $newCodigo)->exists()) {
                $newCodigo = $baseCodigo . '_copy_' . $counter;
                $counter++;

                if (strlen($newCodigo) > 20) {
                    $newCodigo = substr($baseCodigo, 0, 10) . '_' . time() . rand(10, 99);
                    break;
                }
            }

            $newDepartment->codigo = $newCodigo;
            $newDepartment->nombre = $department->nombre . ' (Copia)';

            $newDepartment->direccion = $department->direccion ? $department->direccion . ' (Copia)' : null;
            $newDepartment->descripcion = $department->descripcion ? $department->descripcion . ' (Copia)' : null;

            $newDepartment->parent_id = $department->parent_id;
            $newDepartment->company_id = $department->company_id;

            $newDepartment->save();
        }

        return back()->with('success', 'Departamentos duplicados exitosamente.');
    }

    /**
     * Bulk delete departments
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron departamentos para eliminar.');
        }

        if (Department::whereIn('parent_id', $ids)->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar. Uno o más departamentos son padres de otros.');
        }

        try {
            Department::whereIn('id', $ids)->delete();
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                return redirect()->back()->with('error', 'No se puede eliminar. Al menos uno de los departamentos seleccionados está en uso.');
            }
            return redirect()->back()->with('error', 'Un error de base de datos impidió la eliminación.');
        }

        return back()->with('success', 'Departamentos eliminados exitosamente.');
    }

    public static function getDepartmentFormOptions($excludeId = null)
    {
        $companies = Company::select('id', 'razon_social')->get();
        $parentsQuery = Department::select('id', 'nombre');
        if ($excludeId) {
            $parentsQuery->where('id', '!=', $excludeId);
        }
        $parents = $parentsQuery->get();

        return [
            'companies' => $companies,
            'parents' => $parents,
        ];
    }
}
