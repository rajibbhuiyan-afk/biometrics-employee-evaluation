<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Department;
use App\Models\Position;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get Admin role
        $adminRole = Role::where('name', 'Admin')->first();

        // Get IT department
        $department = Department::where('code', 'IT')->first();

        // Get a position
        $position = Position::first();

        // Create Admin User
        User::create([
            'employee_id' => 'EMP-0001',
            'name' => 'System Administrator',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('P@ssw0rd'),
            'role_id' => $adminRole?->id,
            'department_id' => $department?->id,
            'position_id' => $position?->id,
        ]);
    }
}