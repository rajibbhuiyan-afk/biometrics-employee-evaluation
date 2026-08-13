<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationReviewRequest;
use App\Models\EvaluationReview;
use Illuminate\Http\JsonResponse;

class EvaluationReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $reviews = EvaluationReview::with([
            'evaluation',
            'reviewer',
        ])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    public function store(
        StoreEvaluationReviewRequest $request
    ): JsonResponse {
        $review = EvaluationReview::create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation review created successfully.',
            'data' => $review->load([
                'evaluation',
                'reviewer',
            ]),
        ], 201);
    }

    public function show(
        EvaluationReview $evaluationReview
    ): JsonResponse {
        $evaluationReview->load([
            'evaluation',
            'reviewer',
        ]);

        return response()->json([
            'success' => true,
            'data' => $evaluationReview,
        ]);
    }

    public function update(
        StoreEvaluationReviewRequest $request,
        EvaluationReview $evaluationReview
    ): JsonResponse {
        $evaluationReview->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation review updated successfully.',
            'data' => $evaluationReview->load([
                'evaluation',
                'reviewer',
            ]),
        ]);
    }

    public function destroy(
        EvaluationReview $evaluationReview
    ): JsonResponse {
        $evaluationReview->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation review deleted successfully.',
        ]);
    }
}