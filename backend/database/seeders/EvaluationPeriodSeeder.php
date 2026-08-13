<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EvaluationPeriod;

class EvaluationPeriodSeeder extends Seeder
{
    public function run(): void
    {
        EvaluationPeriod::create([
            'name' => '2026 Annual Performance Evaluation',

            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',

            'submission_start_date' => '2026-08-01',
            'submission_end_date' => '2026-12-15',

            'status' => 'active',

            'description' => 'Annual employee performance evaluation for the year 2026.',
        ]);
    }
}