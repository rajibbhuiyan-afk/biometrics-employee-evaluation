<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EvaluationCategory;
use App\Models\EvaluationQuestion;

class EvaluationQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $questions = [
            'Job Knowledge' => [
                [
                    'question' => 'Demonstrates sufficient knowledge of job responsibilities.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 1,
                    'status' => true,
                ],
                [
                    'question' => 'Understands the tools, technologies and processes required for the job.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 2,
                    'status' => true,
                ],
                [
                    'question' => 'Applies professional knowledge effectively in daily work.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 3,
                    'status' => true,
                ],
            ],

            'Quality of Work' => [
                [
                    'question' => 'Produces accurate and high-quality work.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 1,
                    'status' => true,
                ],
                [
                    'question' => 'Pays attention to details and minimizes errors.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 2,
                    'status' => true,
                ],
                [
                    'question' => 'Completes tasks according to required standards.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 3,
                    'status' => true,
                ],
            ],

            'Productivity' => [
                [
                    'question' => 'Completes assigned tasks within expected deadlines.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 1,
                    'status' => true,
                ],
                [
                    'question' => 'Manages workload and priorities effectively.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 2,
                    'status' => true,
                ],
                [
                    'question' => 'Maintains consistent productivity during working hours.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 3,
                    'status' => true,
                ],
            ],

            'Communication' => [
                [
                    'question' => 'Communicates clearly and professionally with others.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 1,
                    'status' => true,
                ],
                [
                    'question' => 'Responds to work-related communication in a timely manner.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 2,
                    'status' => true,
                ],
                [
                    'question' => 'Provides clear updates about work progress and issues.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 3,
                    'status' => true,
                ],
            ],

            'Teamwork' => [
                [
                    'question' => 'Works effectively with team members.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 1,
                    'status' => true,
                ],
                [
                    'question' => 'Supports colleagues when necessary.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 2,
                    'status' => true,
                ],
                [
                    'question' => 'Maintains a positive and professional attitude within the team.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 3,
                    'status' => true,
                ],
            ],

            'Problem Solving' => [
                [
                    'question' => 'Identifies problems effectively.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 1,
                    'status' => true,
                ],
                [
                    'question' => 'Analyzes problems before taking action.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 2,
                    'status' => true,
                ],
                [
                    'question' => 'Suggests practical and effective solutions.',
                    'question_type' => 'rating',
                    'max_rating' => 5,
                    'weight' => 1.00,
                    'is_required' => true,
                    'sort_order' => 3,
                    'status' => true,
                ],
            ],
        ];

        foreach ($questions as $categoryName => $categoryQuestions) {

            $category = EvaluationCategory::where(
                'name',
                $categoryName
            )->first();

            if (!$category) {
                continue;
            }

            foreach ($categoryQuestions as $question) {

                EvaluationQuestion::create([
                    'category_id' => $category->id,
                    'question' => $question['question'],
                    'question_type' => $question['question_type'],
                    'max_rating' => $question['max_rating'],
                    'weight' => $question['weight'],
                    'is_required' => $question['is_required'],
                    'sort_order' => $question['sort_order'],
                    'status' => $question['status'],
                ]);
            }
        }
    }
}