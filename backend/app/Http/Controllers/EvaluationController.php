<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationRequest;
use App\Models\Evaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    /**
     * Display evaluations according to logged-in user's role.
     *
     * Employee -> Own evaluations only
     * Manager  -> Evaluations of assigned employees only
     * HR       -> All evaluations
     * Admin    -> All evaluations
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $query = Evaluation::with([
            'employee',
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

            /*
             * Only evaluations belonging to employees
             * whose manager_id is the logged-in manager.
             */
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

            // Logged-in employee
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
                    'employee',
                    'evaluationPeriod',
                ]),
            ], 201);

        } catch (QueryException $e) {

            /*
            |--------------------------------------------------------------------------
            | Duplicate database entry
            |--------------------------------------------------------------------------
            */

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
     * Access rules:
     *
     * Employee -> Own evaluation only
     * Manager  -> Assigned employee only
     * HR       -> All
     * Admin    -> All
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

            /*
             * Check whether this evaluation's employee
             * belongs to the logged-in manager.
             */
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

            // Allowed to view any evaluation.
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
        | Load evaluation details
        |--------------------------------------------------------------------------
        */

        $evaluation->load([
            'employee',
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
     * Allowed statuses:
     * draft
     * returned
     * rejected
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
        | Only draft / returned / rejected can be submitted
        |--------------------------------------------------------------------------
        */

        if (!in_array($evaluation->status, [
            'draft',
            'returned',
            'rejected',
        ])) {

            return response()->json([
                'success' => false,
                'message' => 'Only draft, returned, or rejected evaluations can be submitted.',
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

        return response()->json([
            'success' => true,
            'message' => 'Evaluation submitted successfully.',
            'data' => $evaluation->fresh()->load([
                'employee',
                'evaluationPeriod',
                'answers.question.category',
                'reviews.reviewer',
            ]),
        ]);
    }


    /**
     * Employee can update draft / returned / rejected evaluation.
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
        | Only draft / returned / rejected can be updated
        |--------------------------------------------------------------------------
        */

        if (!in_array($evaluation->status, [
            'draft',
            'returned',
            'rejected',
        ])) {

            return response()->json([
                'success' => false,
                'message' => 'Only draft, returned, or rejected evaluations can be updated.',
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
            'data' => $evaluation->fresh()->load([
                'employee',
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

        /*
        |--------------------------------------------------------------------------
        | Only owner can delete
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) auth()->id()
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own evaluation.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Only draft can be deleted
        |--------------------------------------------------------------------------
        */

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
