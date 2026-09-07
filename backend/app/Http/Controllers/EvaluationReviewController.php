<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationReviewRequest;
use App\Models\Evaluation;
use App\Models\EvaluationReview;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EvaluationReviewController extends Controller
{
    /**
     * Display evaluation reviews.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $role = $user->role?->name;

        $query = EvaluationReview::with([
            'evaluation.employee.department',
            'evaluation.employee.position',
            'evaluation.employee.role',
            'evaluation.employee.manager.role',
            'question.category',
            'reviewer',
            'reviewer.role',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | HR / Management / Admin
        |--------------------------------------------------------------------------
        */

        if (in_array($role, ['HR', 'Management', 'Admin'], true)) {

            // Allowed to view review history.

        }

        /*
        |--------------------------------------------------------------------------
        | Employee / Manager
        |--------------------------------------------------------------------------
        */

        elseif (in_array($role, ['Employee', 'Manager'], true)) {

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
     */
    public function store(
        StoreEvaluationReviewRequest $request
    ): JsonResponse {

        $user = auth()->user();
        $role = $user->role?->name;

        /*
        |--------------------------------------------------------------------------
        | Reviewer Roles
        |--------------------------------------------------------------------------
        */

        if (!in_array(
            $role,
            ['Employee', 'Manager', 'HR', 'Management'],
            true
        )) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You do not have permission to review evaluations.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Load Evaluation
        |--------------------------------------------------------------------------
        */

        $evaluation = Evaluation::with([
            'employee',
            'employee.role',
            'employee.manager',
            'employee.manager.role',
            'answers.question.category',
        ])->find(
            $request->evaluation_id
        );


        if (!$evaluation) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Evaluation not found.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Determine Expected Reviewer
        |--------------------------------------------------------------------------
        */

        $expectedReviewer =
            $this->getExpectedReviewer($evaluation);


        if (!$expectedReviewer) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Unable to determine the current reviewer.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Current User Must Be Expected Reviewer
        |--------------------------------------------------------------------------
        */

        if (
            (int) $expectedReviewer->id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You are not the current reviewer for this evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Evaluation Must Have Answers
        |--------------------------------------------------------------------------
        */

        $evaluationAnswers =
            $evaluation->answers;


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

        $submittedReviews =
            collect(
                $request->input(
                    'reviews',
                    []
                )
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
        | Duplicate Questions
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
        | Evaluation Question IDs
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
        | Missing Questions
        |--------------------------------------------------------------------------
        */

        $missingQuestionIds =
            $evaluationQuestionIds
                ->diff(
                    $submittedQuestionIds
                )
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
        | Invalid Questions
        |--------------------------------------------------------------------------
        */

        $invalidQuestionIds =
            $submittedQuestionIds
                ->diff(
                    $evaluationQuestionIds
                )
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
        | Save Review
        |--------------------------------------------------------------------------
        */

        $result = DB::transaction(
            function () use (
                $evaluation,
                $submittedReviews,
                $request,
                $user,
                $role,
                $expectedReviewer
            ) {

                $reviewedAt =
                    $request->reviewed_at ??
                    now();


                /*
                |--------------------------------------------------------------------------
                | Question Reviews
                |--------------------------------------------------------------------------
                */

                foreach (
                    $submittedReviews
                    as $reviewData
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
                            $reviewData['comment'] ??
                            null,

                        'action' =>
                            null,

                        'reviewed_at' =>
                            $reviewedAt,
                    ]);
                }


                /*
                |--------------------------------------------------------------------------
                | Reviewer Stage
                |--------------------------------------------------------------------------
                */

                $stage =
                    $this->getReviewerStage(
                        $expectedReviewer
                    );


                $updateData = [];


                /*
                |--------------------------------------------------------------------------
                | Employee Reviewer
                |--------------------------------------------------------------------------
                */

                if ($stage === 'Employee') {

                    $updateData[
                        'employee_overall_rating'
                    ] =
                        $request->overall_rating;

                    $updateData[
                        'employee_reviewed_at'
                    ] =
                        $reviewedAt;


                    if (
                        $request->action ===
                        'approved'
                    ) {

                        $updateData['status'] =
                            'employee_approved';

                        $updateData[
                            'employee_approved_at'
                        ] =
                            $reviewedAt;

                    } elseif (
                        $request->action ===
                        'rejected'
                    ) {

                        $updateData['status'] =
                            'employee_rejected';
                    }
                }


                /*
                |--------------------------------------------------------------------------
                | Manager Reviewer
                |--------------------------------------------------------------------------
                */

                elseif ($stage === 'Manager') {

                    $updateData[
                        'manager_overall_rating'
                    ] =
                        $request->overall_rating;

                    $updateData[
                        'manager_reviewed_at'
                    ] =
                        $reviewedAt;


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

                    } elseif (
                        $request->action ===
                        'rejected'
                    ) {

                        $updateData['status'] =
                            'manager_rejected';
                    }
                }


                /*
                |--------------------------------------------------------------------------
                | HR Reviewer
                |--------------------------------------------------------------------------
                */

                elseif ($stage === 'HR') {

                    $updateData[
                        'hr_overall_rating'
                    ] =
                        $request->overall_rating;

                    $updateData[
                        'hr_reviewed_at'
                    ] =
                        $reviewedAt;


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

                    } elseif (
                        $request->action ===
                        'rejected'
                    ) {

                        $updateData['status'] =
                            'hr_rejected';
                    }
                }


                /*
                |--------------------------------------------------------------------------
                | Management Reviewer
                |--------------------------------------------------------------------------
                */

                elseif ($stage === 'Management') {

                    $updateData[
                        'management_overall_rating'
                    ] =
                        $request->overall_rating;

                    $updateData[
                        'management_reviewed_at'
                    ] =
                        $reviewedAt;


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

                    } elseif (
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
                | Stage Review History
                |--------------------------------------------------------------------------
                */

                return EvaluationReview::create([
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
                        $reviewedAt,
                ]);
            }
        );


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
                        'evaluation.employee.role',
                        'evaluation.employee.manager.role',
                        'question.category',
                        'reviewer',
                        'reviewer.role',
                    ]),
        ], 201);
    }


    /**
     * Determine the current reviewer.
     */
    private function getExpectedReviewer(
        Evaluation $evaluation
    ) {

        /*
        |--------------------------------------------------------------------------
        | HR SELF EVALUATION
        |--------------------------------------------------------------------------
        |
        | HR does NOT go to their manager.
        |
        | HR
        |   ↓
        | Management
        |
        */

        if (
            $evaluation->status === 'submitted' &&
            $evaluation->employee?->role?->name === 'HR'
        ) {

            return User::whereHas(
                'role',
                function ($query) {
                    $query->where(
                        'name',
                        'Management'
                    );
                }
            )
                ->where(
                    'status',
                    true
                )
                ->first();
        }


        /*
        |--------------------------------------------------------------------------
        | Submitted Normal Employee / Manager
        |--------------------------------------------------------------------------
        */

        if (
            $evaluation->status ===
            'submitted'
        ) {

            return $evaluation
                ->employee
                ?->manager;
        }


        /*
        |--------------------------------------------------------------------------
        | Employee / Manager Approved
        |--------------------------------------------------------------------------
        |
        | Goes to HR.
        |
        */

        if (
            in_array(
                $evaluation->status,
                [
                    'employee_approved',
                    'manager_approved',
                ],
                true
            )
        ) {

            return User::whereHas(
                'role',
                function ($query) {
                    $query->where(
                        'name',
                        'HR'
                    );
                }
            )
                ->where(
                    'status',
                    true
                )
                ->first();
        }


        /*
        |--------------------------------------------------------------------------
        | HR Approved
        |--------------------------------------------------------------------------
        |
        | Goes to Management.
        |
        */

        if (
            $evaluation->status ===
            'hr_approved'
        ) {

            return User::whereHas(
                'role',
                function ($query) {
                    $query->where(
                        'name',
                        'Management'
                    );
                }
            )
                ->where(
                    'status',
                    true
                )
                ->first();
        }


        return null;
    }


    /**
     * Get reviewer stage.
     */
    private function getReviewerStage(
        $reviewer
    ): string {

        return $reviewer
            ->role
            ?->name ?? '';
    }


    /**
     * Display a single review.
     */
    public function show(
        EvaluationReview $evaluationReview
    ): JsonResponse {

        $user = auth()->user();
        $role = $user->role?->name;


        $evaluationReview->load([
            'evaluation.employee.department',
            'evaluation.employee.position',
            'evaluation.employee.role',
            'evaluation.employee.manager.role',
            'question.category',
            'reviewer',
            'reviewer.role',
        ]);


        $evaluation =
            $evaluationReview->evaluation;


        if (!$evaluation) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Evaluation not found.',
            ], 404);
        }


        $isDirectReviewer =
            $evaluation->employee &&
            (int) $evaluation->employee->manager_id ===
            (int) $user->id;


        if (
            in_array(
                $role,
                ['HR', 'Management', 'Admin'],
                true
            )
        ) {

            // Allowed.

        } elseif (
            in_array(
                $role,
                ['Employee', 'Manager'],
                true
            ) &&
            $isDirectReviewer
        ) {

            if (
                (int) $evaluationReview->reviewer_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You can only view your own review history for this evaluation.',
                ], 403);
            }

        } else {

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