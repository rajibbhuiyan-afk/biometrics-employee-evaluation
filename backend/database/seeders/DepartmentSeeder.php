<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        Department::create([
            'name' => 'Information Technology',
            'code' => 'IT',
            'description' => 'Information Technology Department',
            'status' => true,
        ]);

        Department::create([
            'name' => 'Human Resources',
            'code' => 'HR',
            'description' => 'Human Resources Department',
            'status' => true,
        ]);

        Department::create([
            'name' => 'Finance',
            'code' => 'FIN',
            'description' => 'Finance Department',
            'status' => true,
        ]);

        Department::create([
            'name' => 'Administration',
            'code' => 'ADMIN',
            'description' => 'Administration Department',
            'status' => true,
        ]);
    }
}