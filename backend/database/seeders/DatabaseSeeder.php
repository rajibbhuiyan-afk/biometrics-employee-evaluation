<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            DepartmentSeeder::class,
            PositionSeeder::class,
            
            UserSeeder::class,

            EvaluationPeriodSeeder::class,
            EvaluationCategorySeeder::class,
            EvaluationQuestionSeeder::class,
        ]);
    }
}