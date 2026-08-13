<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationPeriodRequest;
use App\Models\EvaluationPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationPeriodController extends Controller
{
    public function index(): JsonResponse
    {
        $periods = EvaluationPeriod::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $periods,
        ]);
    }

    public function store(StoreEvaluationPeriodRequest $request): JsonResponse
    {
        $period = EvaluationPeriod::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Evaluation period created successfully.',
            'data' => $period,
        ], 201);
    }

    public function show(EvaluationPeriod $evaluationPeriod): JsonResponse
    {
        $evaluationPeriod->load('evaluations');

        return response()->json([
            'success' => true,
            'data' => $evaluationPeriod,
        ]);
    }

    public function update(
        StoreEvaluationPeriodRequest $request,
        EvaluationPeriod $evaluationPeriod
    ): JsonResponse {
        $evaluationPeriod->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Evaluation period updated successfully.',
            'data' => $evaluationPeriod,
        ]);
    }

    public function destroy(EvaluationPeriod $evaluationPeriod): JsonResponse
    {
        $evaluationPeriod->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation period deleted successfully.',
        ]);
    }
}