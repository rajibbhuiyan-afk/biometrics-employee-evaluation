<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationRequest;
use App\Models\Evaluation;
use App\Models\EvaluationAnswer;
use App\Models\EvaluationQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;

class EvaluationController extends Controller
{
    /**
     * Display evaluations according to logged-in user's role.
     *
     * Employee -> Own evaluations only
     * Manager  -> Assigned employees only
     * HR       -> All evaluations
     * Admin    -> All evaluations
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $query = Evaluation::with([
            'employee.department',
            'employee.position',
            'evaluationPeriod',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | EMPLOYEE
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Employee') {

            $query->where(
                'employee_id',
                $user->id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        elseif ($user->role->name === 'Manager') {

            $query->whereHas('employee', function ($employeeQuery) use ($user) {

                $employeeQuery->where(
                    'manager_id',
                    $user->id
                );

            });
        }

        /*
        |--------------------------------------------------------------------------
        | HR / ADMIN
        |--------------------------------------------------------------------------
        */

        elseif (in_array($user->role->name, ['HR', 'Admin'])) {

            // HR and Admin can see all evaluations.
        }

        /*
        |--------------------------------------------------------------------------
        | UNKNOWN ROLE
        |--------------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view evaluations.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }


    /**
     * Create a new evaluation.
     *
     * Employee only.
     */
    public function store(
        StoreEvaluationRequest $request
    ): JsonResponse {

        try {

            $employeeId = auth()->id();

            /*
            |--------------------------------------------------------------------------
            | Check duplicate evaluation
            |--------------------------------------------------------------------------
            */

            $existingEvaluation = Evaluation::where(
                'employee_id',
                $employeeId
            )
            ->where(
                'evaluation_period_id',
                $request->evaluation_period_id
            )
            ->first();

            if ($existingEvaluation) {

                return response()->json([
                    'success' => false,
                    'message' => 'You already have an evaluation for this period.',
                ], 409);
            }

            /*
            |--------------------------------------------------------------------------
            | Create evaluation
            |--------------------------------------------------------------------------
            */

            $evaluation = Evaluation::create([
                'employee_id' => $employeeId,
                'evaluation_period_id' => $request->evaluation_period_id,
                'status' => 'draft',
                'employee_comment' => $request->employee_comment,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Evaluation created successfully.',
                'data' => $evaluation->load([
                    'employee.department',
                    'employee.position',
                    'evaluationPeriod',
                ]),
            ], 201);

        } catch (QueryException $e) {

            if (
                isset($e->errorInfo[1]) &&
                $e->errorInfo[1] == 1062
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'This employee already has an evaluation for this period.',
                ], 409);
            }

            throw $e;
        }
    }


    /**
     * Display a single evaluation.
     *
     * Employee -> Own evaluation
     * Manager  -> Assigned employee
     * HR/Admin -> All
     */
    public function show(
        Evaluation $evaluation
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | EMPLOYEE ACCESS
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Employee') {

            if (
                (int) $evaluation->employee_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'You can only view your own evaluation.',
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | MANAGER ACCESS
        |--------------------------------------------------------------------------
        */

        elseif ($user->role->name === 'Manager') {

            $evaluation->loadMissing('employee');

            if (
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'You can only view evaluations of your assigned employees.',
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | HR / ADMIN
        |--------------------------------------------------------------------------
        */

        elseif (in_array($user->role->name, ['HR', 'Admin'])) {

            // Allowed.
        }

        /*
        |--------------------------------------------------------------------------
        | UNKNOWN ROLE
        |--------------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this evaluation.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Load complete evaluation
        |--------------------------------------------------------------------------
        */

        $evaluation->load([
            'employee.department',
            'employee.position',
            'evaluationPeriod',
            'answers.question.category',
            'reviews.reviewer',
        ]);

        return response()->json([
            'success' => true,
            'data' => $evaluation,
        ]);
    }


    /**
     * Employee submits / resubmits evaluation.
     *
     * Allowed:
     *
     * draft
     * manager_returned
     * manager_rejected
     * admin_returned
     * admin_rejected
     */
    public function submit(
        Evaluation $evaluation
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | Only owner can submit
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) auth()->id()
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only submit your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Allowed statuses
        |--------------------------------------------------------------------------
        */

        if (!in_array($evaluation->status, [
            'draft',
            'manager_returned',
            'manager_rejected',
            'admin_returned',
            'admin_rejected',
        ])) {

            return response()->json([
                'success' => false,
                'message' => 'This evaluation cannot be submitted in its current status.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Get active required questions
        |--------------------------------------------------------------------------
        */

        $requiredQuestions = EvaluationQuestion::where(
            'status',
            true
        )
        ->where(
            'is_required',
            true
        )
        ->get();


        /*
        |--------------------------------------------------------------------------
        | Get answered required question IDs
        |--------------------------------------------------------------------------
        |
        | A question is considered answered when:
        |
        | rating exists
        | OR
        | answer contains text
        |
        */

        $answeredQuestionIds = EvaluationAnswer::where(
            'evaluation_id',
            $evaluation->id
        )
        ->where(function ($query) {

            $query->whereNotNull('rating')
                ->orWhere(function ($query) {

                    $query->whereNotNull('answer')
                        ->where('answer', '!=', '');

                });

        })
        ->pluck('question_id')
        ->toArray();


        /*
        |--------------------------------------------------------------------------
        | Find missing required questions
        |--------------------------------------------------------------------------
        */

        $missingRequiredQuestions = $requiredQuestions
            ->whereNotIn(
                'id',
                $answeredQuestionIds
            );


        /*
        |--------------------------------------------------------------------------
        | Required question missing
        |--------------------------------------------------------------------------
        */

        if ($missingRequiredQuestions->count() > 0) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Please answer all required questions before submitting.',

                'missing_questions' =>
                    $missingRequiredQuestions
                        ->values()
                        ->map(function ($question) {

                            return [
                                'id' => $question->id,
                                'question' => $question->question,
                            ];

                        }),
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Submit / Resubmit
        |--------------------------------------------------------------------------
        */

        $evaluation->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);


        /*
        |--------------------------------------------------------------------------
        | Return updated evaluation
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Evaluation submitted successfully.',

            'data' =>
                $evaluation
                    ->fresh()
                    ->load([
                        'employee.department',
                        'employee.position',
                        'evaluationPeriod',
                        'answers.question.category',
                        'reviews.reviewer',
                    ]),
        ]);
    }


    /**
     * Employee can update evaluation comment.
     *
     * Allowed:
     *
     * draft
     * manager_returned
     * manager_rejected
     * admin_returned
     * admin_rejected
     */
    public function update(
        StoreEvaluationRequest $request,
        Evaluation $evaluation
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | Only owner can update
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) auth()->id()
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only update your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Allowed statuses
        |--------------------------------------------------------------------------
        */

        if (!in_array($evaluation->status, [
            'draft',
            'manager_returned',
            'manager_rejected',
            'admin_returned',
            'admin_rejected',
        ])) {

            return response()->json([
                'success' => false,
                'message' => 'This evaluation cannot be updated in its current status.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Update employee comment
        |--------------------------------------------------------------------------
        */

        $evaluation->update([
            'employee_comment' => $request->employee_comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evaluation updated successfully.',
            'data' => $evaluation
                ->fresh()
                ->load([
                    'employee.department',
                    'employee.position',
                    'evaluationPeriod',
                ]),
        ]);
    }


    /**
     * Delete evaluation.
     *
     * Only draft evaluation can be deleted.
     */
    public function destroy(
        Evaluation $evaluation
    ): JsonResponse {

        if (
            (int) $evaluation->employee_id !==
            (int) auth()->id()
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own evaluation.',
            ], 403);
        }


        if ($evaluation->status !== 'draft') {

            return response()->json([
                'success' => false,
                'message' => 'Only draft evaluations can be deleted.',
            ], 422);
        }


        $evaluation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation deleted successfully.',
        ]);
    }
}