<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationReviewRequest;
use App\Models\Evaluation;
use App\Models\EvaluationReview;
use Illuminate\Http\JsonResponse;

class EvaluationReviewController extends Controller
{
    /**
     * Review history.
     *
     * Manager -> Reviews of assigned employees only
     * HR/Admin -> All reviews
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $query = EvaluationReview::with([
            'evaluation.employee',
            'reviewer',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Manager') {

            $query->whereHas(
                'evaluation.employee',
                function ($employeeQuery) use ($user) {

                    $employeeQuery->where(
                        'manager_id',
                        $user->id
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | HR / ADMIN
        |--------------------------------------------------------------------------
        */

        elseif (in_array($user->role->name, ['HR', 'Admin'])) {

            // Can see all review history.
        }

        /*
        |--------------------------------------------------------------------------
        | OTHER ROLES
        |--------------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view review history.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }


    /**
     * Create review / change evaluation status.
     *
     * Actions:
     *
     * submitted -> reviewed
     * reviewed  -> approved
     * reviewed  -> rejected
     * reviewed  -> returned
     */
    public function store(
        StoreEvaluationReviewRequest $request
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Only Manager and HR can review
        |--------------------------------------------------------------------------
        */

        if (!in_array($user->role->name, ['Manager', 'HR'])) {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to review evaluations.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Find evaluation
        |--------------------------------------------------------------------------
        */

        $evaluation = Evaluation::with('employee')
            ->find($request->evaluation_id);

        if (!$evaluation) {

            return response()->json([
                'success' => false,
                'message' => 'Evaluation not found.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | MANAGER OWNERSHIP CHECK
        |--------------------------------------------------------------------------
        |
        | Manager can review ONLY evaluations of employees
        | whose manager_id equals logged-in manager ID.
        |
        */

        if ($user->role->name === 'Manager') {

            if (
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'You can only review evaluations of your assigned employees.',
                ], 403);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | ACTION
        |--------------------------------------------------------------------------
        */

        $action = $request->action;


        /*
        |--------------------------------------------------------------------------
        | REVIEWED
        |--------------------------------------------------------------------------
        */

        if ($action === 'reviewed') {

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

        elseif ($action === 'approved') {

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

        elseif ($action === 'rejected') {

            if (!in_array($evaluation->status, [
                'submitted',
                'reviewed',
            ])) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'This evaluation cannot be rejected in its current status.',
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

        elseif ($action === 'returned') {

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
        | INVALID ACTION
        |--------------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' => 'Invalid review action.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE REVIEW HISTORY
        |--------------------------------------------------------------------------
        */

        $review = EvaluationReview::create([
            'evaluation_id' => $evaluation->id,
            'reviewer_id' => $user->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'action' => $action,
            'reviewed_at' => $request->reviewed_at ?? now(),
        ]);


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' => 'Evaluation review created successfully.',
            'data' => $review->load([
                'evaluation.employee',
                'reviewer',
            ]),
        ], 201);
    }


    /**
     * Show single review.
     */
    public function show(
        EvaluationReview $evaluationReview
    ): JsonResponse {

        $user = auth()->user();

        $evaluationReview->load([
            'evaluation.employee',
            'reviewer',
        ]);

        $evaluation = $evaluationReview->evaluation;

        /*
        |--------------------------------------------------------------------------
        | MANAGER ACCESS CHECK
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Manager') {

            if (
                !$evaluation ||
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You can only view reviews of your assigned employees.',
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | HR / ADMIN
        |--------------------------------------------------------------------------
        */

        elseif (in_array($user->role->name, ['HR', 'Admin'])) {

            // Allowed.
        }

        /*
        |--------------------------------------------------------------------------
        | OTHER ROLES
        |--------------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' =>
                    'You do not have permission to view this review.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $evaluationReview,
        ]);
    }


    /**
     * Update review history record.
     *
     * For security, only the reviewer who created
     * the review can update it.
     */
    public function update(
        StoreEvaluationReviewRequest $request,
        EvaluationReview $evaluationReview
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Only Manager / HR
        |--------------------------------------------------------------------------
        */

        if (!in_array($user->role->name, ['Manager', 'HR'])) {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update reviews.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Load evaluation + employee
        |--------------------------------------------------------------------------
        */

        $evaluationReview->load([
            'evaluation.employee',
        ]);

        $evaluation = $evaluationReview->evaluation;

        /*
        |--------------------------------------------------------------------------
        | MANAGER OWNERSHIP CHECK
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Manager') {

            if (
                !$evaluation ||
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You can only update reviews of your assigned employees.',
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Only original reviewer can update
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluationReview->reviewer_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only update your own review.',
            ], 403);
        }

        $evaluationReview->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Evaluation review updated successfully.',
            'data' => $evaluationReview->fresh()->load([
                'evaluation.employee',
                'reviewer',
            ]),
        ]);
    }


    /**
     * Delete review history record.
     *
     * Only original reviewer can delete.
     */
    public function destroy(
        EvaluationReview $evaluationReview
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Only Manager / HR
        |--------------------------------------------------------------------------
        */

        if (!in_array($user->role->name, ['Manager', 'HR'])) {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete reviews.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Load evaluation
        |--------------------------------------------------------------------------
        */

        $evaluationReview->load([
            'evaluation.employee',
        ]);

        $evaluation = $evaluationReview->evaluation;

        /*
        |--------------------------------------------------------------------------
        | Manager ownership
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Manager') {

            if (
                !$evaluation ||
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You can only delete reviews of your assigned employees.',
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Only original reviewer
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluationReview->reviewer_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only delete your own review.',
            ], 403);
        }

        $evaluationReview->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation review deleted successfully.',
        ]);
    }
}
