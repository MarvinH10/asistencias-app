<?php

namespace App\Http\Controllers\Pages;

use App\Models\User;
use App\Models\Department;
use App\Models\Company;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with(['company', 'department', 'position'])->get();
        return Inertia::render('users', [
            'users' => $users
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('users/create', array_merge([
        ], self::getUserFormOptions()));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'company_id' => 'required|exists:companies,id',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'fecha_ingreso' => 'required|date',
            'fecha_retiro' => 'nullable|date',
            'estado' => 'boolean',
        ], [
            'email.unique' => 'El correo electrónico ya está en uso.',
        ]);

        User::create($validated);

        return redirect()->route('users.index')->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return Inertia::render('users/show', [
            'user' => $user
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        return Inertia::render('users/edit', array_merge([
            'user' => $user->load(['company', 'department', 'position']),
        ], self::getUserFormOptions($user->id)));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'company_id' => 'required|exists:companies,id',
            'department_id' => 'required|exists:departments,id',
            'position_id' => 'required|exists:positions,id',
            'fecha_ingreso' => 'required|date',
            'fecha_retiro' => 'nullable|date',
            'estado' => 'boolean',
        ], [
            'email.unique' => 'El correo electrónico ya está en uso.',
        ]);

        $user->update($validated);

        return redirect()->route('users.index')->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }

    /**
     * Duplicate departments
     */
    public function duplicate(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron usuarios para duplicar.');
        }

        $users = User::whereIn('id', $ids)->get();

        foreach ($users as $user) {
            $newUser = $user->replicate();

            $baseEmail = $user->email;
            $newEmail = $baseEmail . '_copy';
            $counter = 1;

            while (User::where('email', $newEmail)->exists()) {
                $newEmail = $baseEmail . '_copy_' . $counter;
                $counter++;

                if (strlen($newEmail) > 20) {
                    $newEmail = substr($baseEmail, 0, 10) . '_' . time() . rand(10, 99);
                    break;
                }
            }

            $newUser->email = $newEmail;
            $newUser->name = $newUser->name . ' (Copia)';

            $newUser->save();
        }

        return back()->with('success', 'Usuarios duplicados exitosamente.');
    }

    /**
     * Bulk delete users
     */
    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return back()->with('error', 'No se seleccionaron usuarios para eliminar.');
        }

        User::whereIn('id', $ids)->delete();

        return back()->with('success', 'Usuarios eliminados exitosamente.');
    }

    public static function getUserFormOptions($excludeId = null)
    {
        $companies = Company::select('id', 'razon_social');
        $departments = Department::select('id', 'nombre');
        $positions = Position::select('id', 'nombre');
        if ($excludeId) {
            $companies->where('id', '!=', $excludeId);
        }
        if ($excludeId) {
            $departments->where('id', '!=', $excludeId);
        }
        if ($excludeId) {
            $positions->where('id', '!=', $excludeId);
        }
        $companies = $companies->get();
        $departments = $departments->get();
        $positions = $positions->get();

        return [
            'companies' => $companies,
            'departments' => $departments,
            'positions' => $positions,
        ];
    }
}
