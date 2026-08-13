<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationCategoryRequest;
use App\Models\EvaluationCategory;
use Illuminate\Http\JsonResponse;

class EvaluationCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = EvaluationCategory::with('questions')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function store(
        StoreEvaluationCategoryRequest $request
    ): JsonResponse {
        $category = EvaluationCategory::create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation category created successfully.',
            'data' => $category,
        ], 201);
    }

    public function show(
        EvaluationCategory $evaluationCategory
    ): JsonResponse {
        $evaluationCategory->load('questions');

        return response()->json([
            'success' => true,
            'data' => $evaluationCategory,
        ]);
    }

    public function update(
        StoreEvaluationCategoryRequest $request,
        EvaluationCategory $evaluationCategory
    ): JsonResponse {
        $evaluationCategory->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation category updated successfully.',
            'data' => $evaluationCategory,
        ]);
    }

    public function destroy(
        EvaluationCategory $evaluationCategory
    ): JsonResponse {
        $evaluationCategory->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation category deleted successfully.',
        ]);
    }
}