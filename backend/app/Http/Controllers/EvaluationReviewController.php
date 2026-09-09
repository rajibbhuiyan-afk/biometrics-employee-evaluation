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
        | Management এবং Admin সব evaluation দেখতে পারবে।
        |
        */

        if (in_array($reviewerRole, [
            'Management',
            'Admin',
        ], true)) {

            // No restriction.
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
        |
        | HR receive করবে:
        |
        | 1. Manager approved evaluations
        | 2. Employee approved evaluations
        | 3. Employee whose direct boss is HR
        | 4. HR returned evaluations
        |
        | IMPORTANT:
        |
        | Manager self-evaluation এখানে থাকবে না।
        |
        | কারণ:
        |
        | Manager self evaluation
        |      ↓
        | Management
        |
        */

        elseif ($reviewerRole === 'HR') {

            $query->where(function ($q) {

                /*
                |------------------------------------------------------------------
                | Normal workflow
                |------------------------------------------------------------------
                */

                $q->whereIn('status', [
                    'manager_approved',
                    'employee_approved',
                    'hr_returned',
                ])


                /*
                |------------------------------------------------------------------
                | Employee whose direct boss is HR
                |------------------------------------------------------------------
                |
                | Employee
                |    ↓
                | HR Boss
                |
                */

                ->orWhere(function ($hrBossQuery) {

                    $hrBossQuery
                        ->where(
                            'status',
                            'submitted'
                        )
                        ->whereHas(
                            'employee.manager.role',
                            function ($roleQuery) {

                                $roleQuery->where(
                                    'name',
                                    'HR'
                                );
                            }
                        );
                });
            });
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

            $canView = false;


            /*
            |------------------------------------------------------------------
            | Normal HR Review
            |------------------------------------------------------------------
            */

            if (in_array($evaluation->status, [
                'manager_approved',
                'employee_approved',
                'hr_returned',
            ], true)) {

                $canView = true;
            }


            /*
            |------------------------------------------------------------------
            | Employee -> HR Boss
            |------------------------------------------------------------------
            */

            if (
                $evaluation->status === 'submitted' &&
                $evaluation->employee?->manager?->role?->name === 'HR' &&
                (int) $evaluation->employee?->manager_id ===
                (int) $user->id
            ) {

                $canView = true;
            }


            /*
            |------------------------------------------------------------------
            | Manager Self Evaluation
            |------------------------------------------------------------------
            |
            | IMPORTANT:
            |
            | Manager self evaluation এখন HR দেখতে পারবে না।
            |
            | Manager
            |    ↓
            | Management
            |
            */

            if (
                $evaluation->status === 'submitted' &&
                $evaluation->employee?->role?->name === 'Manager'
            ) {

                $canView = false;
            }


            if (!$canView) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'This evaluation is not available for HR review.',
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
                'message' =>
                    'You are not allowed to submit an evaluation review.',
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
            'employee.manager',
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
        */

        if (!$this->canReviewEvaluation(
            $evaluation,
            $user,
            $reviewerRole
        )) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You are not allowed to review this evaluation at this stage.',
                'evaluation_status' =>
                    $evaluation->status,
                'reviewer_role' =>
                    $reviewerRole,
                'employee_role' =>
                    $this->getUserRole(
                        $evaluation->employee
                    ),
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
                'message' =>
                    'All assigned questions must be reviewed.',
                'missing_question_ids' =>
                    $missingQuestionIds,
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
                'message' =>
                    'You submitted reviews for questions that are not assigned to your role.',
                'question_ids' =>
                    $unauthorizedQuestionIds,
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDATE QUESTION REVIEWS
        |--------------------------------------------------------------------------
        */

        foreach (
            $validated['reviews']
            as $index => $review
        ) {

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


            $reviewResult =
                $review['review_result'];

            $rating =
                $review['rating'] ?? null;

            $comment = trim(
                (string) (
                    $review['comment'] ?? ''
                )
            );


            /*
            |------------------------------------------------------------------
            | IGNORE
            |------------------------------------------------------------------
            */

            if ($reviewResult === 'ignore') {

                $rating = null;
            }


            /*
            |------------------------------------------------------------------
            | OKAY
            |------------------------------------------------------------------
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
            |------------------------------------------------------------------
            | NOT OKAY
            |------------------------------------------------------------------
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

        $overallRating =
            $validated['overall_rating'] ?? null;

        if (
            $overallRating !== null &&
            $overallRating !== ''
        ) {

            $overallRating =
                (float) $overallRating;

        } else {

            $overallRating = null;
        }


        /*
        |--------------------------------------------------------------------------
        | SAVE TRANSACTION
        |--------------------------------------------------------------------------
        */

        try {

            DB::transaction(
                function () use (
                    $evaluation,
                    $user,
                    $reviewerRole,
                    $validated,
                    $overallRating
                ) {

                    /*
                    |--------------------------------------------------------------
                    | QUESTION LEVEL REVIEWS
                    |--------------------------------------------------------------
                    */

                    foreach (
                        $validated['reviews']
                        as $review
                    ) {

                        $answer =
                            $evaluation->answers
                                ->firstWhere(
                                    'question_id',
                                    $review['question_id']
                                );

                        $question =
                            $answer?->question;

                        $reviewResult =
                            $review['review_result'];

                        $rating =
                            $review['rating'] ?? null;

                        $comment =
                            $review['comment'] ?? null;


                        /*
                        |----------------------------------------------------------
                        | Ignore / Not Okay
                        |----------------------------------------------------------
                        */

                        if (
                            $reviewResult === 'ignore' ||
                            $reviewResult === 'not_okay'
                        ) {

                            $rating = null;
                        }


                        /*
                        |----------------------------------------------------------
                        | Safety max-rating check
                        |----------------------------------------------------------
                        */

                        if (
                            $reviewResult === 'okay' &&
                            $rating !== null &&
                            $question
                        ) {

                            $maxRating =
                                (float) (
                                    $question->max_rating ?? 10
                                );

                            if (
                                (float) $rating >
                                $maxRating
                            ) {

                                $rating =
                                    $maxRating;
                            }
                        }


                        /*
                        |----------------------------------------------------------
                        | SAVE QUESTION REVIEW
                        |----------------------------------------------------------
                        */

                        EvaluationReview::updateOrCreate(
                            [
                                'evaluation_id' =>
                                    $evaluation->id,

                                'question_id' =>
                                    $review['question_id'],

                                'reviewer_id' =>
                                    $user->id,

                                'reviewer_role' =>
                                    $reviewerRole,
                            ],
                            [
                                'review_result' =>
                                    $reviewResult,

                                'rating' =>
                                    $rating,

                                'comment' =>
                                    $comment,

                                /*
                                | Question review-এর জন্য
                                | action null থাকবে।
                                */

                                'action' =>
                                    null,

                                'reviewed_at' =>
                                    now(),
                            ]
                        );
                    }


                    /*
                    |--------------------------------------------------------------
                    | OVERALL / STAGE REVIEW
                    |--------------------------------------------------------------
                    */

                    EvaluationReview::updateOrCreate(
                        [
                            'evaluation_id' =>
                                $evaluation->id,

                            'question_id' =>
                                null,

                            'reviewer_id' =>
                                $user->id,

                            'reviewer_role' =>
                                $reviewerRole,
                        ],
                        [
                            /*
                            | Stage review-এর জন্য
                            | review_result null.
                            */

                            'review_result' =>
                                null,

                            'rating' =>
                                $overallRating,

                            'comment' =>
                                $validated['overall_comment']
                                    ?? null,

                            'action' =>
                                $validated['action'],

                            'reviewed_at' =>
                                now(),
                        ]
                    );


                    /*
                    |--------------------------------------------------------------
                    | UPDATE STATUS
                    |--------------------------------------------------------------
                    */

                    $this->updateEvaluationStatus(
                        $evaluation,
                        $reviewerRole,
                        $validated['action']
                    );
                }
            );

        } catch (QueryException $exception) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Failed to save evaluation review.',
                'error' =>
                    $exception->getMessage(),
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

            'message' =>
                'Evaluation review saved successfully.',

            'data' =>
                $evaluation,
        ]);
    }


    /**
     * ============================================================
     * CAN REVIEW EVALUATION
     * ============================================================
     *
     * Main workflow:
     *
     * Employee
     *     ↓
     * Manager
     *     ↓
     * HR
     *     ↓
     * Management
     *
     *
     * Employee whose boss is HR:
     *
     * Employee
     *     ↓
     * HR
     *     ↓
     * Management
     *
     *
     * Manager self evaluation:
     *
     * Manager
     *     ↓
     * Management
     *
     *
     * HR self evaluation:
     *
     * HR
     *     ↓
     * Management
     */
    private function canReviewEvaluation(
        Evaluation $evaluation,
        User $user,
        string $reviewerRole
    ): bool {

        /*
        |--------------------------------------------------------------------------
        | NO EMPLOYEE
        |--------------------------------------------------------------------------
        */

        if (!$evaluation->employee) {
            return false;
        }


        $employee =
            $evaluation->employee;

        $employeeRole =
            $this->getUserRole(
                $employee
            );


        /*
        |--------------------------------------------------------------------------
        | MANAGEMENT
        |--------------------------------------------------------------------------
        |
        | Management is final reviewer.
        |
        | Supported:
        |
        | 1. Manager self evaluation
        |       submitted
        |       ↓
        |       Management
        |
        | 2. HR self evaluation
        |       submitted
        |       ↓
        |       Management
        |
        | 3. Normal employee
        |       hr_approved
        |       ↓
        |       Management
        |
        | 4. Management returned/rejected
        |       ↓
        |       Management
        |
        */

        if ($reviewerRole === 'Management') {

            /*
            |------------------------------------------------------------------
            | Manager self evaluation
            |------------------------------------------------------------------
            */

            if (
                $employeeRole === 'Manager' &&
                in_array($evaluation->status, [
                    'submitted',
                    'management_returned',
                    'management_rejected',
                ], true)
            ) {

                return true;
            }


            /*
            |------------------------------------------------------------------
            | HR self evaluation
            |------------------------------------------------------------------
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
            |------------------------------------------------------------------
            | Normal workflow
            |------------------------------------------------------------------
            |
            | Manager / HR approved
            |
            | hr_approved
            |     ↓
            | Management
            |
            */

            if (
                $evaluation->status ===
                'hr_approved'
            ) {

                return true;
            }


            /*
            |------------------------------------------------------------------
            | Management returned
            |------------------------------------------------------------------
            */

            if (
                $evaluation->status ===
                'management_returned'
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
            |------------------------------------------------------------------
            | Manager cannot review own evaluation
            |------------------------------------------------------------------
            */

            if (
                (int) $employee->id ===
                (int) $user->id
            ) {

                return false;
            }


            /*
            |------------------------------------------------------------------
            | FIRST SUBMISSION
            |------------------------------------------------------------------
            |
            | Employee
            |     ↓
            | Direct Manager
            |
            */

            if (
                $evaluation->status ===
                'submitted'
            ) {

                /*
                | HR boss হলে Manager reviewer হবে না।
                */

                if (
                    $employee->manager &&
                    $this->getUserRole(
                        $employee->manager
                    ) === 'HR'
                ) {

                    return false;
                }


                return (
                    (int) $employee->manager_id ===
                    (int) $user->id
                );
            }


            /*
            |------------------------------------------------------------------
            | MANAGER REJECTED / RETURNED
            |------------------------------------------------------------------
            */

            if (in_array(
                $evaluation->status,
                [
                    'manager_rejected',
                    'manager_returned',
                ],
                true
            )) {

                return (
                    (int) $employee->manager_id ===
                    (int) $user->id
                );
            }


            /*
            |------------------------------------------------------------------
            | HR REJECTED / RETURNED
            |------------------------------------------------------------------
            |
            | Normal employee:
            |     HR → Manager
            |
            | HR boss employee:
            |     HR remains reviewer
            |
            */

            if (in_array(
                $evaluation->status,
                [
                    'hr_rejected',
                    'hr_returned',
                ],
                true
            )) {

                if (
                    $employee->manager &&
                    $this->getUserRole(
                        $employee->manager
                    ) === 'HR'
                ) {

                    return false;
                }


                return (
                    (int) $employee->manager_id ===
                    (int) $user->id
                );
            }


            /*
            |------------------------------------------------------------------
            | MANAGEMENT REJECTED
            |------------------------------------------------------------------
            |
            | Normal employee:
            |     Management → Manager
            |
            | HR boss employee:
            |     Management → HR
            |
            */

            if (
                $evaluation->status ===
                'management_rejected'
            ) {

                if (
                    $employee->manager &&
                    $this->getUserRole(
                        $employee->manager
                    ) === 'HR'
                ) {

                    return false;
                }


                return (
                    (int) $employee->manager_id ===
                    (int) $user->id
                );
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
            |------------------------------------------------------------------
            | HR cannot review own evaluation
            |------------------------------------------------------------------
            */

            if (
                (int) $employee->id ===
                (int) $user->id
            ) {

                return false;
            }


            /*
            |------------------------------------------------------------------
            | IMPORTANT:
            | Manager self evaluation DOES NOT go to HR.
            | It goes directly to Management.
            |------------------------------------------------------------------
            */

            if (
                $employeeRole === 'Manager' &&
                in_array(
                    $evaluation->status,
                    [
                        'submitted',
                        'manager_approved',
                        'employee_approved',
                    ],
                    true
                )
            ) {

                /*
                | Manager self evaluation must never
                | be reviewed by HR.
                */

                if (
                    $employee->id === $user->id
                ) {

                    return false;
                }


                /*
                | Direct Manager self-evaluation check.
                */

                if (
                    $employee->manager_id === null
                ) {

                    return false;
                }
            }


            /*
            |------------------------------------------------------------------
            | Employee -> HR Boss
            |------------------------------------------------------------------
            |
            | Employee
            |     ↓
            | HR Boss
            |
            */

            if (
                $evaluation->status ===
                'submitted' &&
                $employeeRole === 'Employee' &&
                $employee->manager &&
                $this->getUserRole(
                    $employee->manager
                ) === 'HR' &&
                (int) $employee->manager_id ===
                (int) $user->id
            ) {

                return true;
            }


            /*
            |------------------------------------------------------------------
            | NORMAL HR REVIEW
            |------------------------------------------------------------------
            |
            | Manager
            |     ↓
            | HR
            |
            */

            if (in_array(
                $evaluation->status,
                [
                    'manager_approved',
                    'employee_approved',
                    'hr_returned',
                ],
                true
            )) {

                /*
                | Manager self evaluation is excluded.
                */

                if (
                    $employeeRole === 'Manager'
                ) {

                    return false;
                }


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
        | Management reviews ALL questions.
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
        | Admin is view-only.
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

                $question =
                    $answer->question;

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
                        'status' =>
                            'manager_approved',
                    ]);

                    break;


                case 'HR':

                    $evaluation->update([
                        'status' =>
                            'hr_approved',
                    ]);

                    break;


                case 'Management':

                    $evaluation->update([
                        'status' =>
                            'completed',
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
                    | Resubmit -> Manager.
                    */

                    $evaluation->update([
                        'status' =>
                            'manager_rejected',
                    ]);

                    break;


                case 'HR':

                    /*
                    | Employee gets it back.
                    | Resubmit routing depends on
                    | employee's workflow.
                    */

                    $evaluation->update([
                        'status' =>
                            'hr_rejected',
                    ]);

                    break;


                case 'Management':

                    /*
                    | Employee gets it back.
                    */

                    $evaluation->update([
                        'status' =>
                            'management_rejected',
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
                        'status' =>
                            'manager_returned',
                    ]);

                    break;


                case 'HR':

                    /*
                    | Employee correction.
                    |
                    | Normal employee:
                    |     Resubmit -> Manager
                    |
                    | HR-boss employee:
                    |     Resubmit -> HR
                    */

                    $evaluation->update([
                        'status' =>
                            'hr_returned',
                    ]);

                    break;


                case 'Management':

                    /*
                    | Employee correction.
                    |
                    | Normal workflow:
                    | Management returned
                    |     ↓
                    | HR/previous stage
                    |
                    | Current implementation keeps:
                    | management_returned
                    */

                    $evaluation->update([
                        'status' =>
                            'management_returned',
                    ]);

                    break;
            }
        }
    }
}