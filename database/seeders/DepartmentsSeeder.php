<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;

class DepartmentsSeeder extends Seeder
{
    public function run()
    {
        Department::create([
            'nombre' => 'Administración',
            'codigo' => 'ADM001',
            'direccion' => 'Jr. Abtao Nro. 1101 Huánuco',
            'descripcion' => 'Departamento de administración y gestión general',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'Cocina',
            'codigo' => 'COC001',
            'direccion' => 'Jr. Abtao Nro. 1101 Huánuco',
            'descripcion' => 'Departamento de cocina y preparación de alimentos',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'Servicio',
            'codigo' => 'SER001',
            'direccion' => 'Jr. Abtao Nro. 1101 Huánuco',
            'descripcion' => 'Departamento de atención al cliente y servicio',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'Bar',
            'codigo' => 'BAR001',
            'direccion' => 'Jr. Abtao Nro. 1101 Huánuco',
            'descripcion' => 'Departamento de bar y preparación de bebidas',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'Limpieza',
            'codigo' => 'LIM001',
            'direccion' => 'Jr. Abtao Nro. 1101 Huánuco',
            'descripcion' => 'Departamento de limpieza y mantenimiento',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'Seguridad',
            'codigo' => 'SEG001',
            'direccion' => 'Jr. Abtao Nro. 1101 Huánuco',
            'descripcion' => 'Departamento de seguridad y vigilancia',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
        Department::create([
            'nombre' => 'Ventas',
            'codigo' => 'VEN001',
            'direccion' => 'Jr. Abtao Nro. 1101 Huánuco',
            'descripcion' => 'Departamento de ventas y marketing',
            'estado' => true,
            'parent_id' => null,
            'company_id' => 1,
        ]);
    }
}