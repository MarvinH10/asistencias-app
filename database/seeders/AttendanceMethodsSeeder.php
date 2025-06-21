<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AttendanceMethod;

class AttendanceMethodsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $methods = [
            ['clave' => 'QR', 'nombre' => 'QR', 'descripcion' => 'Registro mediante escaneo de código QR'],
            ['clave' => 'BIOMETRICO', 'nombre' => 'Biométrico', 'descripcion' => 'Registro mediante huella dactilar u otro dato biométrico'],
            ['clave' => 'MANUAL', 'nombre' => 'Manual', 'descripcion' => 'Registro manual por un administrador'],
        ];

        foreach ($methods as $method) {
            AttendanceMethod::create($method);
        }
    }
}