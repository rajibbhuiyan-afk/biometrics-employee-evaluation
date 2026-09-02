<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationReviewRequest;
use App\Models\Evaluation;
use App\Models\EvaluationAnswer;
use App\Models\EvaluationReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class EvaluationReviewController extends Controller
{
    /**
     * Review history.
     *
     * Manager     -> Assigned employees only
     * HR          -> All reviews
     * Management  -> All reviews
     * Admin       -> All reviews
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $query = EvaluationReview::with([
            'evaluation.employee.department',
            'evaluation.employee.position',
            'question.category',
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
        | HR / MANAGEMENT / ADMIN
        |--------------------------------------------------------------------------
        */

        elseif (
            in_array(
                $user->role->name,
                ['HR', 'Management', 'Admin']
            )
        ) {

            // Allowed to view all review history.
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
     * Create evaluation review.
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
     * HR
     *      ├── approved  → hr_approved
     *      ├── returned  → hr_returned
     *      └── rejected  → hr_rejected
     *
     * hr_approved
     *      ↓
     * Management
     *      ├── approved  → management_approved
     *      ├── returned  → management_returned
     *      └── rejected  → management_rejected
     *
     * management_approved
     *      ↓
     * completed
     */
    public function store(
        StoreEvaluationReviewRequest $request
    ): JsonResponse {

        $user = auth()->user();
        $role = $user->role->name;

        /*
        |--------------------------------------------------------------------------
        | Only Manager / HR / Management Can Review
        |--------------------------------------------------------------------------
        */

        if (
            !in_array(
                $role,
                ['Manager', 'HR', 'Management']
            )
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Only Manager, HR or Management can review evaluations.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Find Evaluation
        |--------------------------------------------------------------------------
        */

        $evaluation = Evaluation::with([
            'employee',
            'answers.question',
        ])->find(
            $request->evaluation_id
        );

        if (!$evaluation) {

            return response()->json([
                'success' => false,
                'message' => 'Evaluation not found.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Check Review Permission And Current Status
        |--------------------------------------------------------------------------
        */

        if ($role === 'Manager') {

            /*
            |----------------------------------------------------------------------
            | Manager must be assigned manager
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
            | Manager reviews submitted evaluations
            |---------------------------------------------------------------------- 
            */

            if ($evaluation->status !== 'submitted') {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Only submitted evaluations can be reviewed by the manager.',
                ], 422);
            }
        }


        elseif ($role === 'HR') {

            /*
            |----------------------------------------------------------------------
            | HR reviews manager-approved evaluations
            |---------------------------------------------------------------------- 
            */

            if ($evaluation->status !== 'manager_approved') {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Only manager-approved evaluations can be reviewed by HR.',
                ], 422);
            }
        }


        elseif ($role === 'Management') {

            /*
            |----------------------------------------------------------------------
            | Management reviews HR-approved evaluations
            |---------------------------------------------------------------------- 
            */

            if ($evaluation->status !== 'hr_approved') {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Only HR-approved evaluations can be reviewed by Management.',
                ], 422);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Get Evaluation Questions
        |--------------------------------------------------------------------------
        |
        | We use the questions already attached to this evaluation
        | through evaluation_answers.
        |
        | We DO NOT check current question status here.
        |
        */

        $evaluationAnswers = $evaluation->answers;

        if ($evaluationAnswers->count() === 0) {

            return response()->json([
                'success' => false,
                'message' =>
                    'No questions found for this evaluation.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Submitted Reviews
        |--------------------------------------------------------------------------
        */

        $submittedReviews = collect(
            $request->reviews
        );


        /*
        |--------------------------------------------------------------------------
        | Check Duplicate Question Reviews
        |--------------------------------------------------------------------------
        */

        $questionIds = $submittedReviews
            ->pluck('question_id')
            ->map(fn ($id) => (int) $id);

        if ($questionIds->duplicates()->count() > 0) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Duplicate question reviews are not allowed.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Check All Evaluation Questions Are Reviewed
        |--------------------------------------------------------------------------
        */

        $evaluationQuestionIds = $evaluationAnswers
            ->pluck('question_id')
            ->map(fn ($id) => (int) $id)
            ->sort()
            ->values();

        $submittedQuestionIds = $questionIds
            ->sort()
            ->values();

        $missingQuestionIds = $evaluationQuestionIds
            ->diff($submittedQuestionIds)
            ->values();

        if ($missingQuestionIds->count() > 0) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Please review all questions before submitting the evaluation review.',
                'missing_question_ids' =>
                    $missingQuestionIds,
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Check Invalid Questions
        |--------------------------------------------------------------------------
        */

        $invalidQuestionIds = $submittedQuestionIds
            ->diff($evaluationQuestionIds)
            ->values();

        if ($invalidQuestionIds->count() > 0) {

            return response()->json([
                'success' => false,
                'message' =>
                    'One or more questions do not belong to this evaluation.',
                'invalid_question_ids' =>
                    $invalidQuestionIds,
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Transaction
        |--------------------------------------------------------------------------
        */

        $result = DB::transaction(function () use (
            $evaluation,
            $submittedReviews,
            $request,
            $user,
            $role
        ) {

            /*
            |----------------------------------------------------------------------
            | Create Question-Level Reviews
            |----------------------------------------------------------------------
            */

            foreach ($submittedReviews as $reviewData) {

                EvaluationReview::create([
                    'evaluation_id' => $evaluation->id,

                    'question_id' =>
                        $reviewData['question_id'],

                    'reviewer_id' =>
                        $user->id,

                    'reviewer_role' =>
                        $role,

                    'review_result' =>
                        $reviewData['review_result'],

                    'rating' =>
                        $reviewData['rating'],

                    'comment' =>
                        $reviewData['comment'] ?? null,

                    'action' => null,

                    'reviewed_at' =>
                        $request->reviewed_at ?? now(),
                ]);
            }


            /*
            |----------------------------------------------------------------------
            | Determine Status And Rating Column
            |----------------------------------------------------------------------
            */

            $updateData = [];


            /*
            |----------------------------------------------------------------------
            | MANAGER
            |----------------------------------------------------------------------
            */

            if ($role === 'Manager') {

                $updateData[
                    'manager_overall_rating'
                ] = $request->overall_rating;

                $updateData[
                    'manager_reviewed_at'
                ] = $request->reviewed_at ?? now();


                if ($request->action === 'approved') {

                    $updateData['status'] =
                        'manager_approved';

                    $updateData[
                        'manager_approved_at'
                    ] = $request->reviewed_at ?? now();
                }

                elseif ($request->action === 'returned') {

                    $updateData['status'] =
                        'manager_returned';
                }

                elseif ($request->action === 'rejected') {

                    $updateData['status'] =
                        'manager_rejected';
                }
            }


            /*
            |----------------------------------------------------------------------
            | HR
            |----------------------------------------------------------------------
            */

            elseif ($role === 'HR') {

                $updateData[
                    'hr_overall_rating'
                ] = $request->overall_rating;

                $updateData[
                    'hr_reviewed_at'
                ] = $request->reviewed_at ?? now();


                if ($request->action === 'approved') {

                    $updateData['status'] =
                        'hr_approved';

                    $updateData[
                        'hr_approved_at'
                    ] = $request->reviewed_at ?? now();
                }

                elseif ($request->action === 'returned') {

                    $updateData['status'] =
                        'hr_returned';
                }

                elseif ($request->action === 'rejected') {

                    $updateData['status'] =
                        'hr_rejected';
                }
            }


            /*
            |----------------------------------------------------------------------
            | MANAGEMENT
            |----------------------------------------------------------------------
            */

            elseif ($role === 'Management') {

                $updateData[
                    'management_overall_rating'
                ] = $request->overall_rating;

                $updateData[
                    'management_reviewed_at'
                ] = $request->reviewed_at ?? now();


                if ($request->action === 'approved') {

                    $updateData['status'] =
                        'completed';

                    $updateData[
                        'management_approved_at'
                    ] = $request->reviewed_at ?? now();

                    $updateData[
                        'approved_at'
                    ] = $request->reviewed_at ?? now();
                }

                elseif ($request->action === 'returned') {

                    $updateData['status'] =
                        'management_returned';
                }

                elseif ($request->action === 'rejected') {

                    $updateData['status'] =
                        'management_rejected';
                }
            }


            /*
            |----------------------------------------------------------------------
            | Update Evaluation
            |----------------------------------------------------------------------
            */

            $evaluation->update(
                $updateData
            );


            /*
            |----------------------------------------------------------------------
            | Create Stage-Level Review History
            |----------------------------------------------------------------------
            |
            | question_id = null means this review is for
            | the overall evaluation stage.
            |
            */

            $stageReview = EvaluationReview::create([
                'evaluation_id' =>
                    $evaluation->id,

                'question_id' =>
                    null,

                'reviewer_id' =>
                    $user->id,

                'reviewer_role' =>
                    $role,

                'review_result' =>
                    null,

                'rating' =>
                    $request->overall_rating,

                'comment' =>
                    $request->overall_comment,

                'action' =>
                    $request->action,

                'reviewed_at' =>
                    $request->reviewed_at ?? now(),
            ]);


            return $stageReview;
        });


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' =>
                'Evaluation review created successfully.',

            'data' => $result
                ->fresh()
                ->load([
                    'evaluation.employee.department',
                    'evaluation.employee.position',
                    'question.category',
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
            'evaluation.employee.department',
            'evaluation.employee.position',
            'question.category',
            'reviewer',
        ]);

        $evaluation = $evaluationReview->evaluation;


        /*
        |--------------------------------------------------------------------------
        | MANAGER
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
        | HR / MANAGEMENT / ADMIN
        |--------------------------------------------------------------------------
        */

        elseif (
            in_array(
                $user->role->name,
                ['HR', 'Management', 'Admin']
            )
        ) {

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
     * Review history cannot be updated.
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
     * Review history cannot be deleted.
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