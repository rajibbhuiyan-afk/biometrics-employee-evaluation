<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationRequest;
use App\Models\Evaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class EvaluationController extends Controller
{
    public function index(): JsonResponse
    {
        $evaluations = Evaluation::with([
            'employee',
            'evaluationPeriod',
            'answers.question.category',
            'reviews.reviewer',
        ])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $evaluations,
        ]);
    }


    public function store(
        StoreEvaluationRequest $request
    ): JsonResponse {

        try {

            // Employee can only create evaluation for himself
            if (
                auth()->user()->role->name === 'Employee'
                && (int) $request->employee_id !== (int) auth()->id()
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only create your own evaluation.',
                ], 403);
            }

            // Check if evaluation already exists
            $existingEvaluation = Evaluation::where(
                'employee_id',
                $request->employee_id
            )
            ->where(
                'evaluation_period_id',
                $request->evaluation_period_id
            )
            ->first();

            if ($existingEvaluation) {
                return response()->json([
                    'success' => false,
                    'message' => 'This employee already has an evaluation for this period.',
                ], 409);
            }

            $evaluation = Evaluation::create([
                'employee_id' => $request->employee_id,
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

            if ($e->errorInfo[1] == 1062) {

                return response()->json([
                    'success' => false,
                    'message' => 'This employee already has an evaluation for this period.',
                ], 409);
            }

            throw $e;
        }
    }


    public function show(Evaluation $evaluation): JsonResponse
    {
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
     * Employee submits draft evaluation.
     */
    public function submit(
        Evaluation $evaluation
    ): JsonResponse {

        // Only owner can submit
        if ((int) $evaluation->employee_id !== (int) auth()->id()) {

            return response()->json([
                'success' => false,
                'message' => 'You can only submit your own evaluation.',
            ], 403);
        }

        // Only draft can be submitted
        if ($evaluation->status !== 'draft') {

            return response()->json([
                'success' => false,
                'message' => 'Only draft evaluations can be submitted.',
            ], 422);
        }

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
            ]),
        ]);
    }


    /**
     * Employee can update draft evaluation.
     */
    public function update(
        StoreEvaluationRequest $request,
        Evaluation $evaluation
    ): JsonResponse {

        // Only owner can update
        if ((int) $evaluation->employee_id !== (int) auth()->id()) {

            return response()->json([
                'success' => false,
                'message' => 'You can only update your own evaluation.',
            ], 403);
        }

        // Only draft can be updated
        if ($evaluation->status !== 'draft') {

            return response()->json([
                'success' => false,
                'message' => 'Only draft evaluations can be updated.',
            ], 422);
        }

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


    public function destroy(Evaluation $evaluation): JsonResponse
    {
        if ((int) $evaluation->employee_id !== (int) auth()->id()) {

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