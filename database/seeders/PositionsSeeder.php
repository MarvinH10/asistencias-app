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
            // Administración
            ['nombre' => 'Administrador', 'descripcion' => 'Acceso total al sistema y gestión general'],
            ['nombre' => 'Gerente General', 'descripcion' => 'Supervisa todas las operaciones del negocio'],
            ['nombre' => 'Jefe de Administración', 'descripcion' => 'Gestiona aspectos administrativos y financieros'],
            ['nombre' => 'Contador', 'descripcion' => 'Manejo de contabilidad y finanzas'],
            ['nombre' => 'Recursos Humanos', 'descripcion' => 'Gestión de personal, nómina y contrataciones'],
            
            // Cocina
            ['nombre' => 'Chef Principal', 'descripcion' => 'Jefe de cocina y supervisión de preparación de alimentos'],
            ['nombre' => 'Chef de Cocina', 'descripcion' => 'Preparación de platos principales'],
            ['nombre' => 'Ayudante de Cocina', 'descripcion' => 'Apoyo en la preparación de alimentos'],
            ['nombre' => 'Lavador de Platos', 'descripcion' => 'Limpieza de utensilios y vajilla'],
            ['nombre' => 'Jefe de Cocina', 'descripcion' => 'Supervisión del área de cocina'],
            
            // Servicio
            ['nombre' => 'Jefe de Servicio', 'descripcion' => 'Supervisión del personal de servicio'],
            ['nombre' => 'Mozo', 'descripcion' => 'Atención al cliente y servicio de mesas'],
            ['nombre' => 'Mozo Principal', 'descripcion' => 'Mozo con experiencia y liderazgo'],
            ['nombre' => 'Anfitrión', 'descripcion' => 'Recibe y asigna mesas a los clientes'],
            ['nombre' => 'Cajero', 'descripcion' => 'Manejo de caja y cobros'],
            
            // Bar
            ['nombre' => 'Jefe de Bar', 'descripcion' => 'Supervisión del área de bar'],
            ['nombre' => 'Bartender', 'descripcion' => 'Preparación de bebidas y cócteles'],
            ['nombre' => 'Ayudante de Bar', 'descripcion' => 'Apoyo en el área de bar'],
            
            // Limpieza
            ['nombre' => 'Jefe de Limpieza', 'descripcion' => 'Supervisión del personal de limpieza'],
            ['nombre' => 'Limpieza', 'descripcion' => 'Mantenimiento y limpieza del local'],
            ['nombre' => 'Limpieza de Baños', 'descripcion' => 'Especializado en limpieza de sanitarios'],
            
            // Seguridad
            ['nombre' => 'Jefe de Seguridad', 'descripcion' => 'Supervisión del personal de seguridad'],
            ['nombre' => 'Vigilante', 'descripcion' => 'Seguridad y vigilancia del local'],
            ['nombre' => 'Portero', 'descripcion' => 'Control de acceso y seguridad'],
            
            // Ventas
            ['nombre' => 'Jefe de Ventas', 'descripcion' => 'Supervisión del área de ventas'],
            ['nombre' => 'Vendedor', 'descripcion' => 'Ventas y atención al cliente'],
            ['nombre' => 'Promotor', 'descripcion' => 'Promoción y marketing del negocio'],
            
            // Otros
            ['nombre' => 'Mantenimiento', 'descripcion' => 'Reparaciones y mantenimiento del local'],
            ['nombre' => 'Repartidor', 'descripcion' => 'Entrega de pedidos a domicilio'],
            ['nombre' => 'Practicante', 'descripcion' => 'Personal en formación'],
        ];

        foreach ($positions as $pos) {
            Position::create($pos);
        }
    }
}
