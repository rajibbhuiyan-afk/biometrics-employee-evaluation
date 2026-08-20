<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationRequest;
use App\Models\Evaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;

class EvaluationController extends Controller
{
    /**
     * Display evaluations.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if ($user->role->name === 'Employee') {

            $evaluations = Evaluation::with([
                'employee',
                'evaluationPeriod',
            ])
            ->where('employee_id', $user->id)
            ->latest()
            ->get();

        } else {

            $evaluations = Evaluation::with([
                'employee',
                'evaluationPeriod',
            ])
            ->latest()
            ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $evaluations,
        ]);
    }


    /**
     * Create new evaluation.
     *
     * New evaluation always starts as draft.
     */
    public function store(
        StoreEvaluationRequest $request
    ): JsonResponse {

        try {

            // Logged-in employee
            $employeeId = auth()->id();

            // Check if evaluation already exists
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

            // Create evaluation
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

            // Duplicate entry
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
     * Show single evaluation.
     */
    public function show(
        Evaluation $evaluation
    ): JsonResponse {

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
     * Employee submits evaluation.
     *
     * Allowed statuses:
     *
     * draft
     * returned
     * rejected
     *
     * After submission:
     *
     * submitted
     */
    public function submit(
        Evaluation $evaluation
    ): JsonResponse {

        // Only owner can submit
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
        | Allowed statuses for employee resubmission
        |--------------------------------------------------------------------------
        */

        if (!in_array(
            $evaluation->status,
            [
                'draft',
                'returned',
                'rejected',
            ],
            true
        )) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Only draft, returned, or rejected evaluations can be submitted.',
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
            'data' => $evaluation
                ->fresh()
                ->load([
                    'employee',
                    'evaluationPeriod',
                    'answers.question.category',
                    'reviews.reviewer',
                ]),
        ]);
    }


    /**
     * Employee can update evaluation.
     *
     * Employee can edit:
     *
     * draft
     * returned
     * rejected
     */
    public function update(
        StoreEvaluationRequest $request,
        Evaluation $evaluation
    ): JsonResponse {

        // Only owner can update
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
        | Allowed statuses for editing
        |--------------------------------------------------------------------------
        */

        if (!in_array(
            $evaluation->status,
            [
                'draft',
                'returned',
                'rejected',
            ],
            true
        )) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Only draft, returned, or rejected evaluations can be updated.',
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
                    'employee',
                    'evaluationPeriod',
                    'answers.question.category',
                    'reviews.reviewer',
                ]),
        ]);
    }


    /**
     * Delete evaluation.
     *
     * Only draft evaluations can be deleted.
     */
    public function destroy(
        Evaluation $evaluation
    ): JsonResponse {

        // Only owner can delete
        if (
            (int) $evaluation->employee_id !==
            (int) auth()->id()
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own evaluation.',
            ], 403);
        }


        // Only draft can be deleted
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
