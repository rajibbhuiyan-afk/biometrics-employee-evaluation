<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationReviewRequest;
use App\Models\Evaluation;
use App\Models\EvaluationReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $role = $user->role?->name;

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

        if ($role === 'Manager') {

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
                $role,
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
     * Manager:
     *
     * submitted
     *      |
     *      +---- approved  -> manager_approved
     *      |
     *      +---- returned  -> manager_returned
     *      |
     *      +---- rejected  -> manager_rejected
     *
     * manager_returned / manager_rejected
     *      |
     *      +---- Manager can review again
     *
     * manager_approved
     *      |
     *      +---- HR
     *
     * HR:
     *
     * manager_approved
     *      |
     *      +---- approved  -> hr_approved
     *      +---- returned  -> hr_returned
     *      +---- rejected  -> hr_rejected
     *
     * Management:
     *
     * hr_approved
     *      |
     *      +---- approved  -> completed
     *      +---- returned  -> management_returned
     *      +---- rejected  -> management_rejected
     */
    public function store(
        StoreEvaluationReviewRequest $request
    ): JsonResponse {

        $user = auth()->user();

        $role = $user->role?->name;


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
            'answers.question.category',
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
        | Check Review Permission
        |--------------------------------------------------------------------------
        */

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        if ($role === 'Manager') {

            /*
            |------------------------------------------------------------------
            | Manager can review only assigned employees
            |------------------------------------------------------------------
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
            |------------------------------------------------------------------
            | Allowed Manager Statuses
            |
            | submitted
            | manager_returned
            | manager_rejected
            |
            | manager_approved is VIEW ONLY.
            |------------------------------------------------------------------
            */

            $allowedManagerStatuses = [
                'submitted',
                'manager_returned',
                'manager_rejected',
            ];

            if (
                !in_array(
                    $evaluation->status,
                    $allowedManagerStatuses
                )
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'This evaluation is not available for manager review.',
                ], 422);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | HR
        |--------------------------------------------------------------------------
        */

        elseif ($role === 'HR') {

            if (
                $evaluation->status !==
                'manager_approved'
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Only manager-approved evaluations can be reviewed by HR.',
                ], 422);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | MANAGEMENT
        |--------------------------------------------------------------------------
        */

        elseif ($role === 'Management') {

            if (
                $evaluation->status !==
                'hr_approved'
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Only HR-approved evaluations can be reviewed by Management.',
                ], 422);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Get Evaluation Answers
        |--------------------------------------------------------------------------
        |
        | The questions belonging to this evaluation are taken from
        | evaluation_answers.
        |
        */

        $evaluationAnswers = $evaluation->answers;


        if (
            $evaluationAnswers->count() === 0
        ) {

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
            $request->input('reviews', [])
        );


        if ($submittedReviews->count() === 0) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Please provide review data for all questions.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Check Duplicate Question Reviews
        |--------------------------------------------------------------------------
        */

        $questionIds = $submittedReviews
            ->pluck('question_id')
            ->map(
                fn ($id) => (int) $id
            );


        if (
            $questionIds
                ->duplicates()
                ->count() > 0
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Duplicate question reviews are not allowed.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Questions Belonging To Evaluation
        |--------------------------------------------------------------------------
        */

        $evaluationQuestionIds =
            $evaluationAnswers
                ->pluck('question_id')
                ->map(
                    fn ($id) => (int) $id
                )
                ->sort()
                ->values();


        $submittedQuestionIds =
            $questionIds
                ->sort()
                ->values();


        /*
        |--------------------------------------------------------------------------
        | Check Missing Questions
        |--------------------------------------------------------------------------
        */

        $missingQuestionIds =
            $evaluationQuestionIds
                ->diff(
                    $submittedQuestionIds
                )
                ->values();


        if (
            $missingQuestionIds->count() > 0
        ) {

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

        $invalidQuestionIds =
            $submittedQuestionIds
                ->diff(
                    $evaluationQuestionIds
                )
                ->values();


        if (
            $invalidQuestionIds->count() > 0
        ) {

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

        $result = DB::transaction(
            function () use (
                $evaluation,
                $submittedReviews,
                $request,
                $user,
                $role
            ) {

                /*
                |--------------------------------------------------------------------------
                | Create Question-Level Review History
                |--------------------------------------------------------------------------
                |
                | IMPORTANT:
                | Every review submission creates NEW history.
                | Existing review records are never updated or deleted.
                |
                */

                foreach (
                    $submittedReviews as $reviewData
                ) {

                    EvaluationReview::create([
                        'evaluation_id' =>
                            $evaluation->id,

                        'question_id' =>
                            (int) $reviewData['question_id'],

                        'reviewer_id' =>
                            $user->id,

                        'reviewer_role' =>
                            $role,

                        'review_result' =>
                            $reviewData['review_result'],

                        'rating' =>
                            $reviewData['rating'],

                        'comment' =>
                            $reviewData['comment']
                            ?? null,

                        /*
                        |------------------------------------------------------
                        | Question-level review does not store action.
                        | Action is stored in stage-level review below.
                        |------------------------------------------------------
                        */

                        'action' => null,

                        'reviewed_at' =>
                            $request->reviewed_at
                            ?? now(),
                    ]);
                }


                /*
                |--------------------------------------------------------------------------
                | Evaluation Status Update
                |--------------------------------------------------------------------------
                */

                $updateData = [];


                /*
                |--------------------------------------------------------------------------
                | MANAGER
                |--------------------------------------------------------------------------
                */

                if ($role === 'Manager') {

                    $reviewedAt =
                        $request->reviewed_at
                        ?? now();


                    $updateData[
                        'manager_overall_rating'
                    ] =
                        $request->overall_rating;


                    $updateData[
                        'manager_reviewed_at'
                    ] =
                        $reviewedAt;


                    /*
                    |--------------------------------------------------------------
                    | APPROVED
                    |--------------------------------------------------------------
                    */

                    if (
                        $request->action ===
                        'approved'
                    ) {

                        $updateData['status'] =
                            'manager_approved';


                        $updateData[
                            'manager_approved_at'
                        ] =
                            $reviewedAt;
                    }


                    /*
                    |--------------------------------------------------------------
                    | RETURNED
                    |--------------------------------------------------------------
                    */

                    elseif (
                        $request->action ===
                        'returned'
                    ) {

                        $updateData['status'] =
                            'manager_returned';
                    }


                    /*
                    |--------------------------------------------------------------
                    | REJECTED
                    |--------------------------------------------------------------
                    */

                    elseif (
                        $request->action ===
                        'rejected'
                    ) {

                        $updateData['status'] =
                            'manager_rejected';
                    }
                }


                /*
                |--------------------------------------------------------------------------
                | HR
                |--------------------------------------------------------------------------
                */

                elseif ($role === 'HR') {

                    $reviewedAt =
                        $request->reviewed_at
                        ?? now();


                    $updateData[
                        'hr_overall_rating'
                    ] =
                        $request->overall_rating;


                    $updateData[
                        'hr_reviewed_at'
                    ] =
                        $reviewedAt;


                    /*
                    |--------------------------------------------------------------
                    | APPROVED
                    |--------------------------------------------------------------
                    */

                    if (
                        $request->action ===
                        'approved'
                    ) {

                        $updateData['status'] =
                            'hr_approved';


                        $updateData[
                            'hr_approved_at'
                        ] =
                            $reviewedAt;
                    }


                    /*
                    |--------------------------------------------------------------
                    | RETURNED
                    |--------------------------------------------------------------
                    */

                    elseif (
                        $request->action ===
                        'returned'
                    ) {

                        $updateData['status'] =
                            'hr_returned';
                    }


                    /*
                    |--------------------------------------------------------------
                    | REJECTED
                    |--------------------------------------------------------------
                    */

                    elseif (
                        $request->action ===
                        'rejected'
                    ) {

                        $updateData['status'] =
                            'hr_rejected';
                    }
                }


                /*
                |--------------------------------------------------------------------------
                | MANAGEMENT
                |--------------------------------------------------------------------------
                */

                elseif ($role === 'Management') {

                    $reviewedAt =
                        $request->reviewed_at
                        ?? now();


                    $updateData[
                        'management_overall_rating'
                    ] =
                        $request->overall_rating;


                    $updateData[
                        'management_reviewed_at'
                    ] =
                        $reviewedAt;


                    /*
                    |--------------------------------------------------------------
                    | APPROVED
                    |--------------------------------------------------------------
                    */

                    if (
                        $request->action ===
                        'approved'
                    ) {

                        $updateData['status'] =
                            'completed';


                        $updateData[
                            'management_approved_at'
                        ] =
                            $reviewedAt;


                        $updateData[
                            'approved_at'
                        ] =
                            $reviewedAt;
                    }


                    /*
                    |--------------------------------------------------------------
                    | RETURNED
                    |--------------------------------------------------------------
                    */

                    elseif (
                        $request->action ===
                        'returned'
                    ) {

                        $updateData['status'] =
                            'management_returned';
                    }


                    /*
                    |--------------------------------------------------------------
                    | REJECTED
                    |--------------------------------------------------------------
                    */

                    elseif (
                        $request->action ===
                        'rejected'
                    ) {

                        $updateData['status'] =
                            'management_rejected';
                    }
                }


                /*
                |--------------------------------------------------------------------------
                | Update Evaluation
                |--------------------------------------------------------------------------
                */

                $evaluation->update(
                    $updateData
                );


                /*
                |--------------------------------------------------------------------------
                | Create Stage-Level Review History
                |--------------------------------------------------------------------------
                |
                | question_id = null
                |
                | This record stores:
                | - overall rating
                | - overall comment
                | - action
                |
                */

                $stageReview =
                    EvaluationReview::create([
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
                            $request->reviewed_at
                            ?? now(),
                    ]);


                return $stageReview;
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Evaluation review created successfully.',

            'data' =>
                $result
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

        $role = $user->role?->name;


        $evaluationReview->load([
            'evaluation.employee.department',
            'evaluation.employee.position',
            'question.category',
            'reviewer',
        ]);


        $evaluation =
            $evaluationReview->evaluation;


        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        if ($role === 'Manager') {

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
                $role,
                [
                    'HR',
                    'Management',
                    'Admin',
                ]
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
     *
     * IMPORTANT:
     * Do NOT use StoreEvaluationReviewRequest here.
     *
     * StoreEvaluationReviewRequest contains required fields
     * for creating a review, so using it here causes validation
     * errors before this method is executed.
     */
    public function update(
        Request $request,
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
