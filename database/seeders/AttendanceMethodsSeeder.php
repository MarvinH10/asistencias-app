<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AttendanceMethod;

class AttendanceMethodsSeeder extends Seeder
{
    public function run()
    {
        AttendanceMethod::create([
            'clave' => '1234567890',
            'nombre' => 'QR',
            'descripcion' => 'Método de marcado por QR',
            'estado' => true,
        ]);
        AttendanceMethod::create([
            'clave' => '1234567891',
            'nombre' => 'RFID',
            'descripcion' => 'Método de marcado por RFID',
            'estado' => true,
        ]);
        AttendanceMethod::create([
            'clave' => '1234567892',
            'nombre' => 'Biométrico',
            'descripcion' => 'Método de marcado por biométrico',
            'estado' => true,
        ]);
        AttendanceMethod::create([
            'clave' => '1234567893',
            'nombre' => 'Código de barras',
            'descripcion' => 'Método de marcado por código de barras',
            'estado' => true,
        ]);
    }
}