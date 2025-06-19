<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompaniesSeeder extends Seeder
{
    public function run()
    {
        Company::create([
            'razon_social' => 'Kdosh Store S.A.C.',
            'ruc' => '20542409534',
            'estado' => true,
        ]);
        Company::create([
            'razon_social' => 'Olympo Restobar S.A.C.',
            'ruc' => '20607051292',
            'estado' => true,
        ]);
    }
}