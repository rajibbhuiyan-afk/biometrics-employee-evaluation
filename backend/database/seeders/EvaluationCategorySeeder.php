<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EvaluationCategory;

class EvaluationCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Job Knowledge',
                'description' => 'Knowledge and understanding of job responsibilities.',
                'sort_order' => 1,
                'status' => true,
            ],

            [
                'name' => 'Quality of Work',
                'description' => 'Accuracy, quality and completeness of work.',
                'sort_order' => 2,
                'status' => true,
            ],

            [
                'name' => 'Productivity',
                'description' => 'Ability to complete assigned work efficiently and on time.',
                'sort_order' => 3,
                'status' => true,
            ],

            [
                'name' => 'Communication',
                'description' => 'Communication with colleagues, supervisors and stakeholders.',
                'sort_order' => 4,
                'status' => true,
            ],

            [
                'name' => 'Teamwork',
                'description' => 'Ability to work effectively with team members.',
                'sort_order' => 5,
                'status' => true,
            ],

            [
                'name' => 'Problem Solving',
                'description' => 'Ability to identify problems and find effective solutions.',
                'sort_order' => 6,
                'status' => true,
            ],
        ];

        foreach ($categories as $category) {
            EvaluationCategory::create($category);
        }
    }
}