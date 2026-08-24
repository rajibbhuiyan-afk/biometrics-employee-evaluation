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
     * Manager -> Assigned employees only
     * HR       -> All reviews
     * Admin    -> All reviews
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
                'message' =>
                    'You do not have permission to view review history.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }


    /**
     * Create Manager / Admin review.
     *
     * Workflow:
     *
     * submitted
     *      ↓
     * Manager
     *      ├── approved  → manager_approved
     *      ├── returned  → manager_returned
     *      └── rejected  → manager_rejected
     *
     * manager_approved
     *      ↓
     * Admin
     *      ├── approved  → admin_approved
     *      ├── returned  → admin_returned
     *      └── rejected  → admin_rejected
     */
    public function store(
        StoreEvaluationReviewRequest $request
    ): JsonResponse {

        $user = auth()->user();
        $role = $user->role->name;

        /*
        |--------------------------------------------------------------------------
        | ONLY MANAGER / ADMIN CAN REVIEW
        |--------------------------------------------------------------------------
        */

        if (!in_array($role, ['Manager', 'Admin'])) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Only Manager or Admin can review evaluations.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | FIND EVALUATION
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
        | MANAGER
        |--------------------------------------------------------------------------
        */

        if ($role === 'Manager') {

            /*
            |----------------------------------------------------------------------
            | Manager can review only assigned employee
            |----------------------------------------------------------------------
            */

            if (
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You can only review evaluations of your assigned employees.',
                ], 403);
            }

            /*
            |----------------------------------------------------------------------
            | Manager can review only submitted evaluation
            |----------------------------------------------------------------------
            */

            if ($evaluation->status !== 'submitted') {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Only submitted evaluations can be reviewed by the manager.',
                ], 422);
            }

            /*
            |----------------------------------------------------------------------
            | Manager APPROVED
            |----------------------------------------------------------------------
            */

            if ($request->action === 'approved') {

                $evaluation->update([
                    'status' => 'manager_approved',
                    'manager_reviewed_at' => now(),
                    'manager_approved_at' => now(),
                ]);
            }

            /*
            |----------------------------------------------------------------------
            | Manager RETURNED
            |----------------------------------------------------------------------
            */

            elseif ($request->action === 'returned') {

                $evaluation->update([
                    'status' => 'manager_returned',
                    'manager_reviewed_at' => now(),
                ]);
            }

            /*
            |----------------------------------------------------------------------
            | Manager REJECTED
            |----------------------------------------------------------------------
            */

            elseif ($request->action === 'rejected') {

                $evaluation->update([
                    'status' => 'manager_rejected',
                    'manager_reviewed_at' => now(),
                ]);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | ADMIN FINAL REVIEW
        |--------------------------------------------------------------------------
        */

        elseif ($role === 'Admin') {

            /*
            |----------------------------------------------------------------------
            | Admin can review ONLY manager approved
            |----------------------------------------------------------------------
            */

            if ($evaluation->status !== 'manager_approved') {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Only manager-approved evaluations can be reviewed by admin.',
                ], 422);
            }

            /*
            |----------------------------------------------------------------------
            | Admin APPROVED
            |----------------------------------------------------------------------
            */

            if ($request->action === 'approved') {

                $evaluation->update([
                    'status' => 'admin_approved',
                    'admin_reviewed_at' => now(),
                    'admin_approved_at' => now(),
                ]);
            }

            /*
            |----------------------------------------------------------------------
            | Admin RETURNED
            |----------------------------------------------------------------------
            */

            elseif ($request->action === 'returned') {

                $evaluation->update([
                    'status' => 'admin_returned',
                    'admin_reviewed_at' => now(),
                ]);
            }

            /*
            |----------------------------------------------------------------------
            | Admin REJECTED
            |----------------------------------------------------------------------
            */

            elseif ($request->action === 'rejected') {

                $evaluation->update([
                    'status' => 'admin_rejected',
                    'admin_reviewed_at' => now(),
                ]);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE REVIEW HISTORY
        |--------------------------------------------------------------------------
        */

        $review = EvaluationReview::create([
            'evaluation_id' => $evaluation->id,
            'reviewer_id' => $user->id,
            'reviewer_role' => $role,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'action' => $request->action,
            'reviewed_at' => $request->reviewed_at ?? now(),
        ]);


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' =>
                'Evaluation review created successfully.',
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
        | MANAGER ACCESS
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

        elseif (in_array(
            $user->role->name,
            ['HR', 'Admin']
        )) {

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
     * Update review history.
     *
     * For workflow safety, review history should not normally
     * be edited after creation.
     */
    public function update(
        StoreEvaluationReviewRequest $request,
        EvaluationReview $evaluationReview
    ): JsonResponse {

        return response()->json([
            'success' => false,
            'message' =>
                'Review history cannot be modified after creation.',
        ], 422);
    }


    /**
     * Delete review history.
     *
     * For workflow safety, review history should not normally
     * be deleted.
     */
    public function destroy(
        EvaluationReview $evaluationReview
    ): JsonResponse {

        return response()->json([
            'success' => false,
            'message' =>
                'Review history cannot be deleted.',
        ], 422);
    }
}