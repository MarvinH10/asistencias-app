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
            ['nombre' => 'Vendedor',         'descripcion' => 'Vende productos'],
            ['nombre' => 'Cajero',           'descripcion' => 'Cobra y gestiona pagos'],
            ['nombre' => 'Mozo',             'descripcion' => 'Atiende mesas y toma pedidos'],
            ['nombre' => 'Cocinero',         'descripcion' => 'Prepara alimentos'],
            ['nombre' => 'Recursos Humanos', 'descripcion' => 'Gestión de personal y nómina'],
        ];

        foreach ($positions as $pos) {
            Position::create($pos);
        }
    }
}
