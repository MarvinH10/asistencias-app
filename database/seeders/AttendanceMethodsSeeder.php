<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AttendanceMethod;

class AttendanceMethodsSeeder extends Seeder
{
    public function run()
    {
        AttendanceMethod::create([
            'clave' => 'qr1234567890',
            'nombre' => 'QR',
            'descripcion' => 'Método de marcado por QR',
            'estado' => true,
        ]);
        AttendanceMethod::create([
            'clave' => 'bio1234567890',
            'nombre' => 'Biométrico',
            'descripcion' => 'Método de marcado por biométrico',
            'estado' => true,
        ]);
        AttendanceMethod::create([
            'clave' => 'man1234567890',
            'nombre' => 'Manual',
            'descripcion' => 'Método de marcado manual',
            'estado' => true,
        ]);
    }
}