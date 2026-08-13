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
            $evaluation = Evaluation::create([
                'employee_id' => $request->employee_id,
                'evaluation_period_id' => $request->evaluation_period_id,
                'status' => $request->status ?? 'draft',
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

    public function update(
        StoreEvaluationRequest $request,
        Evaluation $evaluation
    ): JsonResponse {
        $evaluation->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation updated successfully.',
            'data' => $evaluation->load([
                'employee',
                'evaluationPeriod',
            ]),
        ]);
    }

    public function destroy(Evaluation $evaluation): JsonResponse
    {
        $evaluation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation deleted successfully.',
        ]);
    }
}