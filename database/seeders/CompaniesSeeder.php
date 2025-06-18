<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompaniesSeeder extends Seeder
{
    public function run()
    {
        Company::create([
            'razon_social' => 'Empresa 1',
            'ruc' => '1234567890',
            'estado' => true,
        ]);
        Company::create([
            'razon_social' => 'Empresa 2',
            'ruc' => '1234567390',
            'estado' => true,
        ]);
        Company::create([
            'razon_social' => 'Empresa 3',
            'ruc' => '1234567290',
            'estado' => true,
        ]);
    }
}