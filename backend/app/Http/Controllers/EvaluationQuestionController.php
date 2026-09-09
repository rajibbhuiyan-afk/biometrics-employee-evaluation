<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationQuestionRequest;
use App\Models\EvaluationQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class EvaluationQuestionController extends Controller
{
    /**
     * Display evaluation questions.
     *
     * Employee:
     * - Only active questions
     * - Only questions applicable to their department / position
     * - Common questions are also included
     *
     * HR / Management / Admin:
     * - All questions
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $role = $user->role?->name;

        $query = EvaluationQuestion::with([
            'category',
            'department',
            'position',
            'reviewers',
        ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->orderByDesc('updated_at');

        /*
        |--------------------------------------------------------------------------
        | Employee Questions
        |--------------------------------------------------------------------------
        */

        if ($role === 'Employee') {

            $query
                ->where('status', true)

                /*
                |--------------------------------------------------------------
                | Department / Position Applicability
                |--------------------------------------------------------------
                |
                | Supported combinations:
                |
                | 1. department_id = NULL
                |    position_id = NULL
                |    => Common question
                |
                | 2. department_id = specific
                |    position_id = NULL
                |    => Entire department
                |
                | 3. department_id = NULL
                |    position_id = specific
                |    => Specific position
                |
                | 4. department_id = specific
                |    position_id = specific
                |    => Specific department + position
                |
                */

                ->where(function ($q) use ($user) {

                    /*
                    |----------------------------------------------------------
                    | Common Questions
                    |----------------------------------------------------------
                    */

                    $q->where(function ($commonQuery) {

                        $commonQuery
                            ->whereNull('department_id')
                            ->whereNull('position_id');

                    })

                    /*
                    |----------------------------------------------------------
                    | Department / Position Specific Questions
                    |----------------------------------------------------------
                    */

                    ->orWhere(function ($specificQuery) use ($user) {

                        $specificQuery

                            /*
                            |--------------------------------------------------
                            | Department
                            |--------------------------------------------------
                            */

                            ->where(function ($departmentQuery) use ($user) {

                                $departmentQuery
                                    ->whereNull('department_id')
                                    ->orWhere(
                                        'department_id',
                                        $user->department_id
                                    );

                            })

                            /*
                            |--------------------------------------------------
                            | Position
                            |--------------------------------------------------
                            */

                            ->where(function ($positionQuery) use ($user) {

                                $positionQuery
                                    ->whereNull('position_id')
                                    ->orWhere(
                                        'position_id',
                                        $user->position_id
                                    );

                            });

                    });

                });
        }

        /*
        |--------------------------------------------------------------------------
        | Get Questions
        |--------------------------------------------------------------------------
        */

        $questions = $query->get();

        /*
        |--------------------------------------------------------------------------
        | Add reviewer_role_ids
        |--------------------------------------------------------------------------
        |
        | Frontend-এর জন্য সরাসরি role IDs পাঠানো হবে।
        |
        */

        $questions->each(function ($question) {

            $question->reviewer_role_ids =
                $question->reviewers
                    ->pluck('id')
                    ->values();

        });

        return response()->json([
            'success' => true,
            'data' => $questions,
        ]);
    }


    /**
     * Store a new evaluation question.
     */
    public function store(
        StoreEvaluationQuestionRequest $request
    ): JsonResponse {

        $validated = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Reviewer Role IDs আলাদা করা
        |--------------------------------------------------------------------------
        |
        | reviewer_role_ids evaluation_questions table-এর column নয়।
        | এটা evaluation_question_reviewers pivot table-এ যাবে।
        |
        */

        $reviewerRoleIds =
            $validated['reviewer_role_ids'] ?? [];

        unset(
            $validated['reviewer_role_ids']
        );


        /*
        |--------------------------------------------------------------------------
        | Create Question + Reviewer Roles
        |--------------------------------------------------------------------------
        */

        $question = DB::transaction(
            function () use (
                $validated,
                $reviewerRoleIds
            ) {

                /*
                |--------------------------------------------------------------
                | Create Question
                |--------------------------------------------------------------
                */

                $question =
                    EvaluationQuestion::create(
                        $validated
                    );


                /*
                |--------------------------------------------------------------
                | Assign Reviewer Roles
                |--------------------------------------------------------------
                */

                if (
                    !empty($reviewerRoleIds)
                ) {

                    $question->reviewers()->sync(
                        $reviewerRoleIds
                    );
                }


                return $question;
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        $question->load([
            'category',
            'department',
            'position',
            'reviewers',
        ]);


        $question->reviewer_role_ids =
            $question->reviewers
                ->pluck('id')
                ->values();


        return response()->json([
            'success' => true,

            'message' =>
                'Evaluation question created successfully.',

            'data' => $question,

        ], 201);
    }


    /**
     * Display a single evaluation question.
     */
    public function show(
        EvaluationQuestion $evaluationQuestion
    ): JsonResponse {

        $evaluationQuestion->load([
            'category',
            'department',
            'position',
            'reviewers',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Reviewer Role IDs
        |--------------------------------------------------------------------------
        */

        $evaluationQuestion->reviewer_role_ids =
            $evaluationQuestion->reviewers
                ->pluck('id')
                ->values();


        return response()->json([
            'success' => true,
            'data' => $evaluationQuestion,
        ]);
    }


    /**
     * Update an evaluation question.
     *
     * Same StoreEvaluationQuestionRequest is used.
     */
    public function update(
        StoreEvaluationQuestionRequest $request,
        EvaluationQuestion $evaluationQuestion
    ): JsonResponse {

        $validated = $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Reviewer Role IDs আলাদা করা
        |--------------------------------------------------------------------------
        */

        $reviewerRoleIds =
            $validated['reviewer_role_ids'] ?? [];

        unset(
            $validated['reviewer_role_ids']
        );


        /*
        |--------------------------------------------------------------------------
        | Update Question + Sync Reviewer Roles
        |--------------------------------------------------------------------------
        */

        DB::transaction(
            function () use (
                $evaluationQuestion,
                $validated,
                $reviewerRoleIds
            ) {

                /*
                |--------------------------------------------------------------
                | Update Question
                |--------------------------------------------------------------
                */

                $evaluationQuestion->update(
                    $validated
                );


                /*
                |--------------------------------------------------------------
                | Sync Reviewer Roles
                |--------------------------------------------------------------
                |
                | যদি আগে:
                |
                | Employee + Manager
                |
                | এখন:
                |
                | Employee + HR
                |
                | দিলে Manager automatically remove হবে
                | এবং HR add হবে।
                |
                */

                $evaluationQuestion->reviewers()->sync(
                    $reviewerRoleIds
                );
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        $evaluationQuestion->load([
            'category',
            'department',
            'position',
            'reviewers',
        ]);


        $evaluationQuestion->reviewer_role_ids =
            $evaluationQuestion->reviewers
                ->pluck('id')
                ->values();


        return response()->json([
            'success' => true,

            'message' =>
                'Evaluation question updated successfully.',

            'data' => $evaluationQuestion,

        ]);
    }


    /**
     * Delete an evaluation question.
     */
    public function destroy(
        EvaluationQuestion $evaluationQuestion
    ): JsonResponse {

        DB::transaction(
            function () use (
                $evaluationQuestion
            ) {

                /*
                |--------------------------------------------------------------
                | Remove Reviewer Assignments
                |--------------------------------------------------------------
                */

                $evaluationQuestion
                    ->reviewers()
                    ->detach();


                /*
                |--------------------------------------------------------------
                | Delete Question
                |--------------------------------------------------------------
                */

                $evaluationQuestion->delete();
            }
        );


        return response()->json([
            'success' => true,

            'message' =>
                'Evaluation question deleted successfully.',
        ]);
    }
}
