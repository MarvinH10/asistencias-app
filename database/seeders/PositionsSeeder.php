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
            ['nombre' => 'Administrador',    'descripcion' => 'Acceso total al sistema'],
            ['nombre' => 'Gerente',          'descripcion' => 'Supervisa operaciones generales'],
            ['nombre' => 'Supervisor',       'descripcion' => 'Coordina y controla un equipo'],
            ['nombre' => 'Empleado',         'descripcion' => 'Usuario operativo'],
            ['nombre' => 'Recursos Humanos', 'descripcion' => 'Gestión de personal y nómina'],
        ];

        foreach ($positions as $pos) {
            Position::create($pos);
        }
    }
}
