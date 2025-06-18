<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentsSeeder extends Seeder
{
    public function run()
    {
        Department::create([
            'nombre' => 'Departamento 1',
            'codigo' => '1234567890',
            'direccion' => 'Dirección 1',
            'descripcion' => 'Descripción 1',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'Departamento 2',
            'codigo' => '1234567391',
            'direccion' => 'Dirección 2',
            'descripcion' => 'Descripción 2',
            'estado' => true,
            'parent_id' => 1,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'Departamento 3',
            'codigo' => '1234567292',
            'direccion' => 'Dirección 3',
            'descripcion' => 'Descripción 3',
            'estado' => true,
            'parent_id' => 1,
            'company_id' => 1,
        ]);
    }
}