<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationAnswerRequest;
use App\Models\Evaluation;
use App\Models\EvaluationAnswer;
use Illuminate\Http\JsonResponse;

class EvaluationAnswerController extends Controller
{
    /**
     * Display answers.
     *
     * Employee -> Own evaluation answers only
     * Manager  -> Answers of assigned employees only
     * HR/Admin -> All answers
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $query = EvaluationAnswer::with([
            'evaluation.employee',
            'question.category',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | EMPLOYEE
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Employee') {

            $query->whereHas('evaluation', function ($evaluationQuery) use ($user) {

                $evaluationQuery->where(
                    'employee_id',
                    $user->id
                );

            });
        }

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        elseif ($user->role->name === 'Manager') {

            $query->whereHas('evaluation.employee', function ($employeeQuery) use ($user) {

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

            // HR and Admin can see all answers.
        }

        /*
        |--------------------------------------------------------------------------
        | UNKNOWN ROLE
        |--------------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view evaluation answers.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }


    /**
     * Create / save an evaluation answer.
     *
     * Employee can only save answers
     * for their own evaluation.
     *
     * Allowed evaluation statuses:
     * draft
     * returned
     * rejected
     */
    public function store(
        StoreEvaluationAnswerRequest $request
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Only Employee can create answers
        |--------------------------------------------------------------------------
        */

        if ($user->role->name !== 'Employee') {

            return response()->json([
                'success' => false,
                'message' => 'Only employees can submit evaluation answers.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Find evaluation
        |--------------------------------------------------------------------------
        */

        $evaluation = Evaluation::find(
            $request->evaluation_id
        );

        if (!$evaluation) {

            return response()->json([
                'success' => false,
                'message' => 'Evaluation not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Check ownership
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only answer your own evaluation.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Check evaluation status
        |--------------------------------------------------------------------------
        */

        if (!in_array($evaluation->status, [
            'draft',
            'returned',
            'rejected',
        ])) {

            return response()->json([
                'success' => false,
                'message' => 'You cannot edit answers after the evaluation has been submitted.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Create / update answer
        |--------------------------------------------------------------------------
        */

        $answer = EvaluationAnswer::updateOrCreate(
            [
                'evaluation_id' => $request->evaluation_id,
                'question_id' => $request->question_id,
            ],
            [
                'rating' => $request->rating,
                'answer' => $request->answer,
                'comment' => $request->comment,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation answer saved successfully.',
            'data' => $answer->load([
                'evaluation',
                'question.category',
            ]),
        ], 201);
    }


    /**
     * Display a single evaluation answer.
     *
     * Access:
     * Employee -> Own evaluation only
     * Manager  -> Assigned employee only
     * HR/Admin -> All
     */
    public function show(
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {

        $user = auth()->user();

        $evaluationAnswer->load([
            'evaluation.employee',
            'question.category',
        ]);

        $evaluation = $evaluationAnswer->evaluation;

        /*
        |--------------------------------------------------------------------------
        | Employee
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Employee') {

            if (
                !$evaluation ||
                (int) $evaluation->employee_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'You can only view answers from your own evaluation.',
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Manager
        |--------------------------------------------------------------------------
        */

        elseif ($user->role->name === 'Manager') {

            if (
                !$evaluation ||
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'You can only view answers of your assigned employees.',
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
                'message' => 'You do not have permission to view this answer.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $evaluationAnswer,
        ]);
    }


    /**
     * Update an existing evaluation answer.
     *
     * Employee can update only their own answer.
     *
     * Allowed statuses:
     * draft
     * returned
     * rejected
     */
    public function update(
        StoreEvaluationAnswerRequest $request,
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Only Employee can update answers
        |--------------------------------------------------------------------------
        */

        if ($user->role->name !== 'Employee') {

            return response()->json([
                'success' => false,
                'message' => 'Only employees can update evaluation answers.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Load evaluation
        |--------------------------------------------------------------------------
        */

        $evaluationAnswer->load('evaluation');

        $evaluation = $evaluationAnswer->evaluation;

        if (!$evaluation) {

            return response()->json([
                'success' => false,
                'message' => 'Evaluation not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Check ownership
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only update answers from your own evaluation.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Check evaluation status
        |--------------------------------------------------------------------------
        */

        if (!in_array($evaluation->status, [
            'draft',
            'returned',
            'rejected',
        ])) {

            return response()->json([
                'success' => false,
                'message' => 'You cannot update answers after the evaluation has been submitted.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Update answer
        |--------------------------------------------------------------------------
        */

        $evaluationAnswer->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation answer updated successfully.',
            'data' => $evaluationAnswer->fresh()->load([
                'evaluation',
                'question.category',
            ]),
        ]);
    }


    /**
     * Delete an evaluation answer.
     *
     * Employee can delete only their own answer
     * while evaluation is draft/returned/rejected.
     */
    public function destroy(
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Only Employee can delete answers
        |--------------------------------------------------------------------------
        */

        if ($user->role->name !== 'Employee') {

            return response()->json([
                'success' => false,
                'message' => 'Only employees can delete evaluation answers.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Load evaluation
        |--------------------------------------------------------------------------
        */

        $evaluationAnswer->load('evaluation');

        $evaluation = $evaluationAnswer->evaluation;

        if (!$evaluation) {

            return response()->json([
                'success' => false,
                'message' => 'Evaluation not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Check ownership
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only delete answers from your own evaluation.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Check status
        |--------------------------------------------------------------------------
        */

        if (!in_array($evaluation->status, [
            'draft',
            'returned',
            'rejected',
        ])) {

            return response()->json([
                'success' => false,
                'message' => 'You cannot delete answers after the evaluation has been submitted.',
            ], 422);
        }

        $evaluationAnswer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation answer deleted successfully.',
        ]);
    }
}
