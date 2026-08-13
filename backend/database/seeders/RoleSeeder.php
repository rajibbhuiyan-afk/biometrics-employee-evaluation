<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
            'name' => 'Admin',
            'description' => 'System administrator',
            'status' => true,
        ]);

        Role::create([
            'name' => 'HR',
            'description' => 'Human Resource',
            'status' => true,
        ]);

        Role::create([
            'name' => 'Manager',
            'description' => 'Department manager',
            'status' => true,
        ]);

        Role::create([
            'name' => 'Employee',
            'description' => 'Regular employee',
            'status' => true,
        ]);
    }
}