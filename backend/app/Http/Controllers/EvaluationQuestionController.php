<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationQuestionRequest;
use App\Models\EvaluationQuestion;
use Illuminate\Http\JsonResponse;

class EvaluationQuestionController extends Controller
{
    public function index(): JsonResponse
    {
        $questions = EvaluationQuestion::with('category')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $questions,
        ]);
    }

    public function store(
        StoreEvaluationQuestionRequest $request
    ): JsonResponse {
        $question = EvaluationQuestion::create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation question created successfully.',
            'data' => $question->load('category'),
        ], 201);
    }

    public function show(
        EvaluationQuestion $evaluationQuestion
    ): JsonResponse {
        $evaluationQuestion->load('category');

        return response()->json([
            'success' => true,
            'data' => $evaluationQuestion,
        ]);
    }

    public function update(
        StoreEvaluationQuestionRequest $request,
        EvaluationQuestion $evaluationQuestion
    ): JsonResponse {
        $evaluationQuestion->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation question updated successfully.',
            'data' => $evaluationQuestion->load('category'),
        ]);
    }

    public function destroy(
        EvaluationQuestion $evaluationQuestion
    ): JsonResponse {
        $evaluationQuestion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation question deleted successfully.',
        ]);
    }
}