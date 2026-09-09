<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\EvaluationReview;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EvaluationReviewController extends Controller
{
    /**
     * ============================================================
     * INDEX
     * ============================================================
     *
     * Manager:
     *     Direct reports only
     *
     * HR:
     *     HR-reviewable evaluations
     *
     * Management:
     *     ALL evaluations
     *
     * Admin:
     *     ALL evaluations (view only)
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        $reviewerRole = $this->getUserRole($user);

        if (!in_array($reviewerRole, [
            'Manager',
            'HR',
            'Management',
            'Admin',
        ], true)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not allowed to view evaluation reviews.',
            ], 403);
        }

        $query = Evaluation::with([
            'employee.department',
            'employee.position',
            'employee.role',
            'employee.manager.role',

            'evaluationPeriod',

            'answers.question.category',
            'answers.question.department',
            'answers.question.position',
            'answers.question.reviewers',

            'reviews.reviewer',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | MANAGEMENT / ADMIN
        |--------------------------------------------------------------------------
        |
        | No restriction.
        |
        */

        if (in_array($reviewerRole, [
            'Management',
            'Admin',
        ], true)) {

            // All evaluations.
        }

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        elseif ($reviewerRole === 'Manager') {

            $query->whereHas(
                'employee',
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
        | HR
        |--------------------------------------------------------------------------
        */

        elseif ($reviewerRole === 'HR') {

            $query->whereIn('status', [
                'submitted',
                'manager_approved',
                'employee_approved',
            ]);
        }

        $evaluations = $query->get();

        return response()->json([
            'success' => true,
            'data' => $evaluations,
        ]);
    }


    /**
     * ============================================================
     * SHOW
     * ============================================================
     */
    public function show(
        Evaluation $evaluation
    ): JsonResponse {

        $user = auth()->user();

        $reviewerRole = $this->getUserRole($user);

        if (!in_array($reviewerRole, [
            'Manager',
            'HR',
            'Management',
            'Admin',
        ], true)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not allowed to view this evaluation.',
            ], 403);
        }

        $evaluation->load([
            'employee.department',
            'employee.position',
            'employee.role',
            'employee.manager.role',

            'evaluationPeriod',

            'answers.question.category',
            'answers.question.department',
            'answers.question.position',
            'answers.question.reviewers',

            'reviews.reviewer',
            'reviews.reviewerRole',
        ]);

        /*
        |--------------------------------------------------------------------------
        | MANAGEMENT / ADMIN
        |--------------------------------------------------------------------------
        */

        if (in_array($reviewerRole, [
            'Management',
            'Admin',
        ], true)) {

            return response()->json([
                'success' => true,
                'data' => $evaluation,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        if ($reviewerRole === 'Manager') {

            if (
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not allowed to view this evaluation.',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $evaluation,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | HR
        |--------------------------------------------------------------------------
        */

        if ($reviewerRole === 'HR') {

            if (
                !in_array($evaluation->status, [
                    'submitted',
                    'manager_approved',
                    'employee_approved',
                ], true)
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'This evaluation is not available for HR review.',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $evaluation,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'You are not allowed to view this evaluation.',
        ], 403);
    }


    /**
     * ============================================================
     * STORE REVIEW
     * ============================================================
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();

        $reviewerRole = $this->getUserRole($user);

        /*
        |--------------------------------------------------------------------------
        | ADMIN IS VIEW ONLY
        |--------------------------------------------------------------------------
        */

        if (!in_array($reviewerRole, [
            'Manager',
            'HR',
            'Management',
        ], true)) {

            return response()->json([
                'success' => false,
                'message' => 'You are not allowed to submit an evaluation review.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | REQUEST VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([

            'evaluation_id' => [
                'required',
                'integer',
                'exists:evaluations,id',
            ],

            'reviews' => [
                'required',
                'array',
                'min:1',
            ],

            'reviews.*.question_id' => [
                'required',
                'integer',
                'exists:evaluation_questions,id',
            ],

            'reviews.*.review_result' => [
                'required',
                'in:okay,not_okay,ignore',
            ],

            'reviews.*.rating' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'reviews.*.comment' => [
                'nullable',
                'string',
            ],

            'overall_rating' => [
                'nullable',
                'numeric',
                'min:0',
                'max:10',
            ],

            'overall_comment' => [
                'nullable',
                'string',
            ],

            'action' => [
                'required',
                'in:approved,rejected,returned',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | LOAD EVALUATION
        |--------------------------------------------------------------------------
        */

        $evaluation = Evaluation::with([
            'employee.department',
            'employee.position',
            'employee.role',
            'employee.manager.role',

            'answers.question.category',
            'answers.question.department',
            'answers.question.position',
            'answers.question.reviewers',

        ])->findOrFail(
            $validated['evaluation_id']
        );

        /*
        |--------------------------------------------------------------------------
        | CHECK REVIEWER PERMISSION
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | Management does NOT use getExpectedReviewer().
        |
        */

        if (!$this->canReviewEvaluation(
            $evaluation,
            $user,
            $reviewerRole
        )) {

            return response()->json([
                'success' => false,
                'message' => 'You are not allowed to review this evaluation at this stage.',
                'evaluation_status' => $evaluation->status,
                'reviewer_role' => $reviewerRole,
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | GET QUESTIONS CURRENT ROLE CAN REVIEW
        |--------------------------------------------------------------------------
        */

        $assignedQuestionIds = $this->getAssignedQuestionIds(
            $evaluation->answers,
            $reviewerRole
        );

        /*
        |--------------------------------------------------------------------------
        | SUBMITTED QUESTION IDs
        |--------------------------------------------------------------------------
        */

        $submittedQuestionIds = collect(
            $validated['reviews']
        )
            ->pluck('question_id')
            ->map(
                fn ($id) => (int) $id
            )
            ->unique()
            ->sort()
            ->values();

        /*
        |--------------------------------------------------------------------------
        | CHECK MISSING QUESTIONS
        |--------------------------------------------------------------------------
        */

        $missingQuestionIds = $assignedQuestionIds
            ->diff($submittedQuestionIds)
            ->values();

        if ($missingQuestionIds->isNotEmpty()) {

            return response()->json([
                'success' => false,
                'message' => 'All assigned questions must be reviewed.',
                'missing_question_ids' => $missingQuestionIds,
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK UNAUTHORIZED QUESTIONS
        |--------------------------------------------------------------------------
        */

        $unauthorizedQuestionIds = $submittedQuestionIds
            ->diff($assignedQuestionIds)
            ->values();

        if ($unauthorizedQuestionIds->isNotEmpty()) {

            return response()->json([
                'success' => false,
                'message' => 'You submitted reviews for questions that are not assigned to your role.',
                'question_ids' => $unauthorizedQuestionIds,
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | VALIDATE QUESTION REVIEWS
        |--------------------------------------------------------------------------
        */

        foreach ($validated['reviews'] as $index => $review) {

            $answer = $evaluation->answers
                ->firstWhere(
                    'question_id',
                    $review['question_id']
                );

            $question = $answer?->question;

            if (!$question) {

                throw ValidationException::withMessages([
                    "reviews.$index.question_id" =>
                        'Question does not belong to this evaluation.',
                ]);
            }

            $reviewResult = $review['review_result'];

            $rating = $review['rating'] ?? null;

            $comment = trim(
                (string) (
                    $review['comment'] ?? ''
                )
            );

            /*
            |--------------------------------------------------------------------------
            | IGNORE
            |--------------------------------------------------------------------------
            */

            if ($reviewResult === 'ignore') {

                $rating = null;
            }

            /*
            |--------------------------------------------------------------------------
            | OKAY
            |--------------------------------------------------------------------------
            */

            if ($reviewResult === 'okay') {

                if (
                    $rating === null ||
                    $rating === ''
                ) {

                    throw ValidationException::withMessages([
                        "reviews.$index.rating" =>
                            "Rating is required for question {$question->id}.",
                    ]);
                }

                $rating = (float) $rating;

                $maxRating = (float) (
                    $question->max_rating ?? 10
                );

                if ($rating > $maxRating) {

                    throw ValidationException::withMessages([
                        "reviews.$index.rating" =>
                            "Rating for question {$question->id} cannot exceed {$maxRating}.",
                    ]);
                }
            }

            /*
            |--------------------------------------------------------------------------
            | NOT OKAY
            |--------------------------------------------------------------------------
            */

            if ($reviewResult === 'not_okay') {

                if ($comment === '') {

                    throw ValidationException::withMessages([
                        "reviews.$index.comment" =>
                            "Comment is required when question {$question->id} is marked as not okay.",
                    ]);
                }

                $rating = null;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | OVERALL RATING
        |--------------------------------------------------------------------------
        */

        $overallRating = $validated['overall_rating'] ?? null;

        if (
            $overallRating !== null &&
            $overallRating !== ''
        ) {
            $overallRating = (float) $overallRating;
        } else {
            $overallRating = null;
        }

        /*
        |--------------------------------------------------------------------------
        | SAVE TRANSACTION
        |--------------------------------------------------------------------------
        */

        try {

            DB::transaction(function () use (
                $evaluation,
                $user,
                $reviewerRole,
                $validated,
                $overallRating
            ) {

                /*
                |--------------------------------------------------------------------------
                | QUESTION LEVEL REVIEWS
                |--------------------------------------------------------------------------
                */

                foreach ($validated['reviews'] as $review) {

                    $answer = $evaluation->answers
                        ->firstWhere(
                            'question_id',
                            $review['question_id']
                        );

                    $question = $answer?->question;

                    $reviewResult = $review['review_result'];

                    $rating = $review['rating'] ?? null;

                    $comment = $review['comment'] ?? null;

                    /*
                    |--------------------------------------------------------------------------
                    | Ignore / Not Okay
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $reviewResult === 'ignore' ||
                        $reviewResult === 'not_okay'
                    ) {
                        $rating = null;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Safety max-rating check
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $reviewResult === 'okay' &&
                        $rating !== null &&
                        $question
                    ) {

                        $maxRating = (float) (
                            $question->max_rating ?? 10
                        );

                        if ((float) $rating > $maxRating) {
                            $rating = $maxRating;
                        }
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | SAVE QUESTION REVIEW
                    |--------------------------------------------------------------------------
                    */

                    EvaluationReview::updateOrCreate(
                        [
                            'evaluation_id' => $evaluation->id,
                            'question_id' => $review['question_id'],
                            'reviewer_id' => $user->id,
                            'reviewer_role' => $reviewerRole,
                        ],
                        [
                            'review_result' => $reviewResult,
                            'rating' => $rating,
                            'comment' => $comment,

                            /*
                            | Question review has no action.
                            */
                            'action' => null,

                            'reviewed_at' => now(),
                        ]
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | OVERALL / STAGE REVIEW
                |--------------------------------------------------------------------------
                |
                | review_result = NULL
                |
                | action = approved / rejected / returned
                |
                */

                EvaluationReview::updateOrCreate(
                    [
                        'evaluation_id' => $evaluation->id,
                        'question_id' => null,
                        'reviewer_id' => $user->id,
                        'reviewer_role' => $reviewerRole,
                    ],
                    [
                        /*
                        | IMPORTANT
                        |
                        | Do NOT put approved/rejected here.
                        */
                        'review_result' => null,

                        'rating' => $overallRating,

                        'comment' => $validated['overall_comment']
                            ?? null,

                        /*
                        | Stage action.
                        */
                        'action' => $validated['action'],

                        'reviewed_at' => now(),
                    ]
                );

                /*
                |--------------------------------------------------------------------------
                | UPDATE STATUS
                |--------------------------------------------------------------------------
                */

                $this->updateEvaluationStatus(
                    $evaluation,
                    $reviewerRole,
                    $validated['action']
                );
            });

        } catch (QueryException $exception) {

            return response()->json([
                'success' => false,
                'message' => 'Failed to save evaluation review.',
                'error' => $exception->getMessage(),
            ], 500);
        }

        /*
        |--------------------------------------------------------------------------
        | RELOAD
        |--------------------------------------------------------------------------
        */

        $evaluation->refresh();

        $evaluation->load([
            'employee.department',
            'employee.position',
            'employee.role',
            'employee.manager.role',

            'evaluationPeriod',

            'answers.question.category',
            'answers.question.department',
            'answers.question.position',
            'answers.question.reviewers',

            'reviews.reviewer',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evaluation review saved successfully.',
            'data' => $evaluation,
        ]);
    }


    /**
     * ============================================================
     * CAN REVIEW EVALUATION
     * ============================================================
     */
    private function canReviewEvaluation(
        Evaluation $evaluation,
        User $user,
        string $reviewerRole
    ): bool {

        /*
        |--------------------------------------------------------------------------
        | No employee
        |--------------------------------------------------------------------------
        */

        if (!$evaluation->employee) {
            return false;
        }

        $employeeRole = $this->getUserRole(
            $evaluation->employee
        );

        /*
        |--------------------------------------------------------------------------
        | MANAGEMENT
        |--------------------------------------------------------------------------
        |
        | Management does NOT need an assigned reviewer.
        |
        */

        if ($reviewerRole === 'Management') {

            /*
            |--------------------------------------------------------------------------
            | HR self evaluation
            |--------------------------------------------------------------------------
            */

            if (
                $employeeRole === 'HR' &&
                in_array($evaluation->status, [
                    'submitted',
                    'management_returned',
                    'management_rejected',
                ], true)
            ) {
                return true;
            }

            /*
            |--------------------------------------------------------------------------
            | Normal evaluation
            |--------------------------------------------------------------------------
            |
            | First time Management receives it:
            |
            | hr_approved
            |
            */

            if ($evaluation->status === 'hr_approved') {
                return true;
            }

            /*
            |--------------------------------------------------------------------------
            | Management returned
            |--------------------------------------------------------------------------
            |
            | If your frontend resubmits directly to Management.
            |
            */

            if (
                $evaluation->status === 'management_returned' &&
                (int) $evaluation->employee->manager_id ===
                (int) $user->id
            ) {
                return true;
            }

            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | MANAGER
        |--------------------------------------------------------------------------
        */

        if ($reviewerRole === 'Manager') {

            /*
            |--------------------------------------------------------------------------
            | First submission
            |--------------------------------------------------------------------------
            */

            if ($evaluation->status === 'submitted') {

                return (int) $evaluation->employee->manager_id ===
                    (int) $user->id;
            }

            /*
            |--------------------------------------------------------------------------
            | Manager rejected / returned
            |--------------------------------------------------------------------------
            |
            | Employee resubmits and it comes back to Manager.
            |
            */

            if (in_array($evaluation->status, [
                'manager_rejected',
                'manager_returned',
            ], true)) {

                return (int) $evaluation->employee->manager_id ===
                    (int) $user->id;
            }

            /*
            |--------------------------------------------------------------------------
            | HR rejected
            |--------------------------------------------------------------------------
            |
            | HR rejection sends employee back to Manager.
            |
            */

            if (in_array($evaluation->status, [
                'hr_rejected',
                'hr_returned',
            ], true)) {

                return (int) $evaluation->employee->manager_id ===
                    (int) $user->id;
            }

            /*
            |--------------------------------------------------------------------------
            | Management rejected
            |--------------------------------------------------------------------------
            |
            | Management rejection sends employee back to Manager.
            |
            */

            if (in_array($evaluation->status, [
                'management_rejected',
            ], true)) {

                return (int) $evaluation->employee->manager_id ===
                    (int) $user->id;
            }

            return false;
        }

        /*
        |--------------------------------------------------------------------------
        | HR
        |--------------------------------------------------------------------------
        */

        if ($reviewerRole === 'HR') {

            /*
            |--------------------------------------------------------------------------
            | HR cannot review own evaluation
            |--------------------------------------------------------------------------
            */

            if (
                (int) $evaluation->employee->id ===
                (int) $user->id
            ) {
                return false;
            }

            /*
            |--------------------------------------------------------------------------
            | Normal workflow
            |--------------------------------------------------------------------------
            */

            if (in_array($evaluation->status, [
                'manager_approved',
                'employee_approved',
            ], true)) {

                return true;
            }

            /*
            |--------------------------------------------------------------------------
            | HR returned
            |--------------------------------------------------------------------------
            |
            | Employee resubmits directly to HR.
            |
            */

            if ($evaluation->status === 'hr_returned') {
                return true;
            }

            return false;
        }

        return false;
    }


    /**
     * ============================================================
     * GET USER ROLE
     * ============================================================
     */
    private function getUserRole(
        ?User $user
    ): string {

        if (!$user) {
            return '';
        }

        return trim(
            (string) (
                $user->role?->name
                ?? $user->role_name
                ?? ''
            )
        );
    }


    /**
     * ============================================================
     * GET ASSIGNED QUESTION IDS
     * ============================================================
     *
     * Management:
     *     ALL QUESTIONS
     *
     * Manager / HR:
     *     Assigned questions only
     */
    private function getAssignedQuestionIds(
        Collection $evaluationAnswers,
        string $reviewerRole
    ): Collection {

        /*
        |--------------------------------------------------------------------------
        | MANAGEMENT
        |--------------------------------------------------------------------------
        |
        | No assignment required.
        |
        */

        if ($reviewerRole === 'Management') {

            return $evaluationAnswers
                ->filter(
                    fn ($answer) =>
                        $answer->question !== null
                )
                ->pluck('question_id')
                ->map(
                    fn ($id) => (int) $id
                )
                ->unique()
                ->sort()
                ->values();
        }

        /*
        |--------------------------------------------------------------------------
        | ADMIN
        |--------------------------------------------------------------------------
        |
        | Admin is view-only, but keep this logic for safety.
        |
        */

        if ($reviewerRole === 'Admin') {

            return $evaluationAnswers
                ->filter(
                    fn ($answer) =>
                        $answer->question !== null
                )
                ->pluck('question_id')
                ->map(
                    fn ($id) => (int) $id
                )
                ->unique()
                ->sort()
                ->values();
        }

        /*
        |--------------------------------------------------------------------------
        | MANAGER / HR
        |--------------------------------------------------------------------------
        */

        return $evaluationAnswers
            ->filter(function ($answer) use (
                $reviewerRole
            ) {

                $question = $answer->question;

                if (!$question) {
                    return false;
                }

                if (
                    !$question->relationLoaded(
                        'reviewers'
                    )
                ) {
                    return false;
                }

                return $question->reviewers->contains(
                    function ($reviewer) use (
                        $reviewerRole
                    ) {

                        return trim(
                            (string) $reviewer->name
                        ) === $reviewerRole;
                    }
                );
            })
            ->pluck('question_id')
            ->map(
                fn ($id) => (int) $id
            )
            ->unique()
            ->sort()
            ->values();
    }


    /**
     * ============================================================
     * UPDATE EVALUATION STATUS
     * ============================================================
     */
    private function updateEvaluationStatus(
        Evaluation $evaluation,
        string $reviewerRole,
        string $action
    ): void {

        /*
        |--------------------------------------------------------------------------
        | APPROVED
        |--------------------------------------------------------------------------
        */

        if ($action === 'approved') {

            switch ($reviewerRole) {

                case 'Manager':

                    $evaluation->update([
                        'status' => 'manager_approved',
                    ]);

                    break;


                case 'HR':

                    $evaluation->update([
                        'status' => 'hr_approved',
                    ]);

                    break;


                case 'Management':

                    $evaluation->update([
                        'status' => 'completed',
                    ]);

                    break;
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | REJECTED
        |--------------------------------------------------------------------------
        */

        if ($action === 'rejected') {

            switch ($reviewerRole) {

                case 'Manager':

                    /*
                    | Employee gets it back.
                    | After resubmit -> Manager.
                    */
                    $evaluation->update([
                        'status' => 'manager_rejected',
                    ]);

                    break;


                case 'HR':

                    /*
                    | Employee gets it back.
                    | After resubmit -> Manager.
                    */
                    $evaluation->update([
                        'status' => 'hr_rejected',
                    ]);

                    break;


                case 'Management':

                    /*
                    | Employee gets it back.
                    | After resubmit -> Manager.
                    */
                    $evaluation->update([
                        'status' => 'management_rejected',
                    ]);

                    break;
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | RETURNED
        |--------------------------------------------------------------------------
        */

        if ($action === 'returned') {

            switch ($reviewerRole) {

                case 'Manager':

                    /*
                    | Employee correction.
                    | Resubmit -> Manager.
                    */
                    $evaluation->update([
                        'status' => 'manager_returned',
                    ]);

                    break;


                case 'HR':

                    /*
                    | Employee correction.
                    | Resubmit -> HR.
                    */
                    $evaluation->update([
                        'status' => 'hr_returned',
                    ]);

                    break;


                case 'Management':

                    /*
                    | Employee correction.
                    | Resubmit -> Management.
                    */
                    $evaluation->update([
                        'status' => 'management_returned',
                    ]);

                    break;
            }
        }
    }
}