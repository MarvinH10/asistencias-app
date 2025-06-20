<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Position;

class PositionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            ['nombre' => 'Administrador', 'descripcion' => 'Acceso total al sistema'],
            ['nombre' => 'Gerente', 'descripcion' => 'Supervisa operaciones generales'],
            ['nombre' => 'Recursos Humanos', 'descripcion' => 'Gestión de personal y nómina'],
            ['nombre' => 'Empleado', 'descripcion' => 'Emplea para la empresa'],
        ];

        foreach ($positions as $pos) {
            Position::create($pos);
        }
    }
}
