<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use App\Models\Department;
use App\Models\Position;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CompaniesSeeder::class,
            DepartmentsSeeder::class,
            PositionsSeeder::class,
            AttendanceMethodsSeeder::class,
        ]);

        $company = Company::first();
        $department = Department::first();
        $position = Position::first();

        User::factory()->create([
            'name' => 'Marvin Campos',
            'email' => 'marvinhectorcamposdeza@gmail.com',
            'password' => Hash::make('210701'),
            'company_id' => $company->id,
            'department_id' => $department->id,
            'position_id' => $position->id,
        ]);
    }
}
