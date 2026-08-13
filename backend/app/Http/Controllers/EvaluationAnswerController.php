<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationAnswerRequest;
use App\Models\EvaluationAnswer;
use Illuminate\Http\JsonResponse;

class EvaluationAnswerController extends Controller
{
    public function index(): JsonResponse
    {
        $answers = EvaluationAnswer::with([
            'evaluation',
            'question.category',
        ])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $answers,
        ]);
    }

    public function store(
        StoreEvaluationAnswerRequest $request
    ): JsonResponse {
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
                'question.category',
            ]),
        ], 201);
    }

    public function show(
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {
        $evaluationAnswer->load([
            'evaluation',
            'question.category',
        ]);

        return response()->json([
            'success' => true,
            'data' => $evaluationAnswer,
        ]);
    }

    public function update(
        StoreEvaluationAnswerRequest $request,
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {
        $evaluationAnswer->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation answer updated successfully.',
            'data' => $evaluationAnswer->load([
                'question.category',
            ]),
        ]);
    }

    public function destroy(
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {
        $evaluationAnswer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation answer deleted successfully.',
        ]);
    }
}