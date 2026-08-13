<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        $it = Department::where('code', 'IT')->first();
        $hr = Department::where('code', 'HR')->first();
        $finance = Department::where('code', 'FIN')->first();
        $admin = Department::where('code', 'ADMIN')->first();

        Position::create([
            'title' => 'Junior Software Engineer',
            'code' => 'JSE',
            'department_id' => $it->id,
            'description' => 'Junior level software engineer',
            'status' => true,
        ]);

        Position::create([
            'title' => 'Software Engineer',
            'code' => 'SE',
            'department_id' => $it->id,
            'description' => 'Software engineer',
            'status' => true,
        ]);

        Position::create([
            'title' => 'Senior Software Engineer',
            'code' => 'SSE',
            'department_id' => $it->id,
            'description' => 'Senior level software engineer',
            'status' => true,
        ]);

        Position::create([
            'title' => 'HR Executive',
            'code' => 'HR-EXE',
            'department_id' => $hr->id,
            'description' => 'Human Resource Executive',
            'status' => true,
        ]);

        Position::create([
            'title' => 'HR Manager',
            'code' => 'HR-MGR',
            'department_id' => $hr->id,
            'description' => 'Human Resource Manager',
            'status' => true,
        ]);

        Position::create([
            'title' => 'Finance Executive',
            'code' => 'FIN-EXE',
            'department_id' => $finance->id,
            'description' => 'Finance Executive',
            'status' => true,
        ]);

        Position::create([
            'title' => 'Admin Officer',
            'code' => 'ADM-OFF',
            'department_id' => $admin->id,
            'description' => 'Administration Officer',
            'status' => true,
        ]);
    }
}