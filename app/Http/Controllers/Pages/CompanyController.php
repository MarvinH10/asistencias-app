<?php

namespace App\Http\Controllers\Pages;

use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $companies = Company::all();
        return Inertia::render('companies', [
            'companies' => $companies
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('companies/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'razon_social' => 'required|string|max:255',
            'ruc' => 'required|string|max:20',
            'estado' => 'boolean',
        ]);

        Company::create($validated);

        return redirect()->route('companies.index')->with('success', 'Compañía creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Company $company)
    {
        return Inertia::render('companies/show', [
            'company' => $company
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Company $company)
    {
        return Inertia::render('companies/edit', [
            'company' => $company
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'razon_social' => 'required|string|max:255',
            'ruc' => 'required|string|max:20',
            'estado' => 'boolean',
        ]);

        $company->update($validated);

        return redirect()->route('companies.index')->with('success', 'Compañía actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        $company->delete();

        return redirect()->route('companies.index')
            ->with('success', 'Compañía eliminada exitosamente.');
    }

    /**
     * Duplicate companies
     */
    public function duplicate(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron compañías para duplicar.');
        }

        $companies = Company::whereIn('id', $ids)->get();

        foreach ($companies as $company) {
            $newCompany = $company->replicate();
            $newCompany->razon_social = $company->razon_social;
            $newCompany->ruc = $company->ruc . '_copy_' . time();
            $newCompany->save();
        }

        return back()->with('success', 'Compañías duplicadas exitosamente.');
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
