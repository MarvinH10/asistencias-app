<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentsSeeder extends Seeder
{
    public function run()
    {
        Department::create([
            'nombre' => 'Abtao Kdosh',
            'codigo' => '10001',
            'direccion' => 'Jr. Abtao Nro. 1101 Huánuco',
            'descripcion' => 'Departamento de Huánuco Abtao',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'San Martin Kdosh',
            'codigo' => '10002',
            'direccion' => 'Jr. San Martin Nro. 967 Huánuco',
            'descripcion' => 'Departamento de Huánuco San Martin',
            'estado' => true,
            'parent_id' => 1,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'Abtao Olympo',
            'codigo' => '10003',
            'direccion' => 'Jr. Abtao Nro. 1101 Huánuco',
            'descripcion' => 'Departamento de Huánuco Abtao',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 2,
        ]);
        Department::create([
            'nombre' => 'Tingo María Kdosh',
            'codigo' => '10131',
            'direccion' => 'Av. Raymondy 269 Tingo Maria',
            'descripcion' => 'Departamento de Tingo María',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
    }
}