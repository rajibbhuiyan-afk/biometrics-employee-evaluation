<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationReviewRequest;
use App\Models\Evaluation;
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

    $evaluation = Evaluation::findOrFail(
        $request->evaluation_id
    );

    // Reviewer must be logged-in user
    if ((int) $request->reviewer_id !== (int) auth()->id()) {

        return response()->json([
            'success' => false,
            'message' => 'Reviewer ID must match the logged-in user.',
        ], 403);
    }

    /*
    |--------------------------------------------------------------------------
    | REVIEWED
    |--------------------------------------------------------------------------
    */

    if ($request->action === 'reviewed') {

        if ($evaluation->status !== 'submitted') {

            return response()->json([
                'success' => false,
                'message' => 'Only submitted evaluations can be reviewed.',
            ], 422);
        }

        $evaluation->update([
            'status' => 'reviewed',
            'reviewed_at' => now(),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | APPROVED
    |--------------------------------------------------------------------------
    */

    elseif ($request->action === 'approved') {

        if ($evaluation->status !== 'reviewed') {

            return response()->json([
                'success' => false,
                'message' => 'Only reviewed evaluations can be approved.',
            ], 422);
        }

        $evaluation->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | REJECTED
    |--------------------------------------------------------------------------
    */

    elseif ($request->action === 'rejected') {

        if (!in_array($evaluation->status, [
            'submitted',
            'reviewed'
        ])) {

            return response()->json([
                'success' => false,
                'message' => 'This evaluation cannot be rejected in its current status.',
            ], 422);
        }

        $evaluation->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | RETURNED
    |--------------------------------------------------------------------------
    */

    elseif ($request->action === 'returned') {

        if ($evaluation->status !== 'reviewed') {

            return response()->json([
                'success' => false,
                'message' => 'Only reviewed evaluations can be returned.',
            ], 422);
        }

        $evaluation->update([
            'status' => 'returned',
            'reviewed_at' => now(),
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE REVIEW RECORD
    |--------------------------------------------------------------------------
    */

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