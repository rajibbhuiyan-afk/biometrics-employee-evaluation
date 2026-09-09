<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationRequest;
use App\Models\Evaluation;
use App\Models\EvaluationAnswer;
use App\Models\EvaluationQuestion;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class EvaluationController extends Controller
{
    /**
     * ================================================================
     * DASHBOARD EVALUATIONS
     * ================================================================
     *
     * Employee:
     *      Own evaluations
     *      + evaluations of direct reports
     *
     * Manager:
     *      Own evaluations
     *      + evaluations of direct reports
     *
     * HR:
     *      All evaluations
     *
     * Management:
     *      All evaluations
     *
     * Admin:
     *      All evaluations
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $role = $user->role?->name;

        $query = Evaluation::with([
            'employee.department',
            'employee.position',
            'employee.role',
            'employee.manager.role',
            'evaluationPeriod',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | HR / Management / Admin
        |--------------------------------------------------------------------------
        |
        | These roles can see ALL evaluations.
        |
        */

        if (in_array(
            $role,
            ['HR', 'Management', 'Admin'],
            true
        )) {

            // No additional filter.
            // All evaluations are visible.

        }

        /*
        |--------------------------------------------------------------------------
        | Employee / Manager
        |--------------------------------------------------------------------------
        |
        | Can see:
        |
        | 1. Own evaluation
        | 2. Direct reports' evaluations
        |
        | This works regardless of whether the direct report
        | is Employee, Manager, etc.
        |
        */

        elseif (in_array(
            $role,
            ['Employee', 'Manager'],
            true
        )) {

            $query->where(function ($q) use ($user) {

                /*
                | Own evaluation
                */
                $q->where(
                    'employee_id',
                    $user->id
                )

                /*
                | Direct reports
                */
                ->orWhereHas(
                    'employee',
                    function ($employeeQuery) use ($user) {

                        $employeeQuery->where(
                            'manager_id',
                            $user->id
                        );
                    }
                );
            });

        }

        /*
        |--------------------------------------------------------------------------
        | Unknown Role
        |--------------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' =>
                    'You do not have permission to view evaluations.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }


    /**
     * ================================================================
     * MY EVALUATIONS
     * ================================================================
     *
     * IMPORTANT:
     *
     * This endpoint is ONLY for "My Evaluations".
     *
     * Every user will see ONLY evaluations where:
     *
     * evaluation.employee_id = logged-in user id
     *
     * Therefore:
     *
     * Employee -> own only
     * Manager  -> own only
     * HR       -> own only
     * Management -> own only
     * Admin -> own only
     */
    public function myEvaluations(): JsonResponse
    {
        $user = auth()->user();

        $evaluations = Evaluation::with([
            'employee.department',
            'employee.position',
            'employee.role',
            'employee.manager.role',
            'evaluationPeriod',
        ])
            ->where(
                'employee_id',
                $user->id
            )
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $evaluations,
        ]);
    }


    /**
     * ================================================================
     * CREATE EVALUATION
     * ================================================================
     *
     * Employee / Manager / HR can create
     * their own self evaluation.
     */
    public function store(
        StoreEvaluationRequest $request
    ): JsonResponse {

        $user = auth()->user();

        $role = $user->role?->name;

        /*
        |--------------------------------------------------------------------------
        | Allowed Roles
        |--------------------------------------------------------------------------
        */

        if (!in_array(
            $role,
            ['Employee', 'Manager', 'HR'],
            true
        )) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You do not have permission to create an evaluation.',
            ], 403);
        }


        try {

            $employeeId = $user->id;

            /*
            |--------------------------------------------------------------------------
            | Prevent Duplicate Evaluation
            |--------------------------------------------------------------------------
            */

            $existingEvaluation = Evaluation::where(
                'employee_id',
                $employeeId
            )
                ->where(
                    'evaluation_period_id',
                    $request->evaluation_period_id
                )
                ->first();


            if ($existingEvaluation) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You already have an evaluation for this period.',
                ], 409);
            }


            /*
            |--------------------------------------------------------------------------
            | Create Evaluation + Answers
            |--------------------------------------------------------------------------
            */

            $evaluation = DB::transaction(
                function () use (
                    $request,
                    $employeeId,
                    $user
                ) {

                    /*
                    |--------------------------------------------------------------------------
                    | Create Evaluation
                    |--------------------------------------------------------------------------
                    */

                    $evaluation = Evaluation::create([
                        'employee_id' =>
                            $employeeId,

                        'evaluation_period_id' =>
                            $request->evaluation_period_id,

                        'status' =>
                            'draft',

                        'employee_comment' =>
                            $request->employee_comment,
                    ]);


                    /*
                    |--------------------------------------------------------------------------
                    | Find Applicable Questions
                    |--------------------------------------------------------------------------
                    |
                    | Question is included ONLY when:
                    |
                    | 1. Question is active
                    |
                    | AND
                    |
                    | 2. Department matches OR question department is NULL
                    |
                    | AND
                    |
                    | 3. Position matches OR question position is NULL
                    |
                    |
                    | Examples:
                    |
                    | department_id = NULL
                    | position_id   = NULL
                    |
                    | -> Everyone gets question.
                    |
                    |
                    | department_id = 5
                    | position_id   = NULL
                    |
                    | -> Everyone in department 5 gets question.
                    |
                    |
                    | department_id = NULL
                    | position_id   = 8
                    |
                    | -> Everyone in position 8 gets question.
                    |
                    |
                    | department_id = 5
                    | position_id   = 8
                    |
                    | -> Only department 5 + position 8 gets question.
                    |
                    */

                    $activeQuestions =
                        EvaluationQuestion::query()

                            /*
                            |--------------------------------------------------------------------------
                            | Question must be active
                            |--------------------------------------------------------------------------
                            */

                            ->where(
                                'status',
                                true
                            )

                            /*
                            |--------------------------------------------------------------------------
                            | Department matching
                            |--------------------------------------------------------------------------
                            */

                            ->where(function ($query) use ($user) {

                                $query
                                    ->whereNull(
                                        'department_id'
                                    )
                                    ->orWhere(
                                        'department_id',
                                        $user->department_id
                                    );
                            })

                            /*
                            |--------------------------------------------------------------------------
                            | Position matching
                            |--------------------------------------------------------------------------
                            */

                            ->where(function ($query) use ($user) {

                                $query
                                    ->whereNull(
                                        'position_id'
                                    )
                                    ->orWhere(
                                        'position_id',
                                        $user->position_id
                                    );
                            })

                            /*
                            |--------------------------------------------------------------------------
                            | Ordering
                            |--------------------------------------------------------------------------
                            */

                            ->orderBy(
                                'sort_order'
                            )
                            ->orderBy(
                                'id'
                            )
                            ->get();


                    /*
                    |--------------------------------------------------------------------------
                    | Create Answer Snapshot
                    |--------------------------------------------------------------------------
                    |
                    | Important:
                    |
                    | Once evaluation is created, the applicable questions
                    | are stored in evaluation_answers.
                    |
                    | Therefore:
                    |
                    | - HR changes question status later
                    | - HR changes department later
                    | - HR changes position later
                    |
                    | Existing evaluation will NOT lose its questions.
                    |
                    */

                    foreach (
                        $activeQuestions as $question
                    ) {

                        EvaluationAnswer::create([
                            'evaluation_id' =>
                                $evaluation->id,

                            'question_id' =>
                                $question->id,

                            'rating' =>
                                null,

                            'answer' =>
                                null,

                            'comment' =>
                                null,
                        ]);
                    }


                    return $evaluation;
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
                    'Evaluation created successfully.',

                'data' =>
                    $evaluation
                        ->fresh()
                        ->load([
                            'employee.department',
                            'employee.position',
                            'employee.role',
                            'employee.manager.role',

                            'evaluationPeriod',

                            'answers.question.category',
                            'answers.question.department',
                            'answers.question.position',
                            'answers.question.reviewers',
                        ]),
            ], 201);

        } catch (QueryException $e) {

            /*
            |--------------------------------------------------------------------------
            | Duplicate Entry
            |--------------------------------------------------------------------------
            */

            if (
                isset($e->errorInfo[1]) &&
                $e->errorInfo[1] == 1062
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'This employee already has an evaluation for this period.',
                ], 409);
            }

            throw $e;
        }
    }


    /**
     * ================================================================
     * SHOW SINGLE EVALUATION
     * ================================================================
     */
    public function show(
        Evaluation $evaluation
    ): JsonResponse {

        $user = auth()->user();

        $role = $user->role?->name;


        /*
        |--------------------------------------------------------------------------
        | Load Employee Information
        |--------------------------------------------------------------------------
        */

        $evaluation->loadMissing([
            'employee',
            'employee.role',
            'employee.manager',
            'employee.manager.role',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Owner
        |--------------------------------------------------------------------------
        */

        $isOwner =
            (int) $evaluation->employee_id ===
            (int) $user->id;


        /*
        |--------------------------------------------------------------------------
        | Direct Report
        |--------------------------------------------------------------------------
        |
        | Logged-in user is the manager/boss of
        | the employee whose evaluation is being viewed.
        |
        */

        $isDirectReviewer =
            $evaluation->employee &&
            (int) $evaluation->employee->manager_id ===
            (int) $user->id;


        /*
        |--------------------------------------------------------------------------
        | Access
        |--------------------------------------------------------------------------
        */

        if (in_array(
            $role,
            ['HR', 'Management', 'Admin'],
            true
        )) {

            /*
            | Full access.
            */

        }

        elseif (
            $isOwner ||
            $isDirectReviewer
        ) {

            /*
            | Own or direct report.
            */

        }

        else {

            return response()->json([
                'success' => false,
                'message' =>
                    'You do not have permission to view this evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Load Full Evaluation
        |--------------------------------------------------------------------------
        */

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
            'reviews.reviewer.role',
            'reviews.question.category',
            'reviews.question.reviewers',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Review Visibility
        |--------------------------------------------------------------------------
        */

        /*
        |--------------------------------------------------------------------------
        | Owner
        |--------------------------------------------------------------------------
        |
        | Normal employee/manager/HR viewing their own evaluation
        | should not see reviewer reviews.
        |
        */

        if (
            $isOwner &&
            !in_array(
                $role,
                ['HR', 'Management', 'Admin'],
                true
            )
        ) {

            $filteredReviews = collect();
        }

        /*
        |--------------------------------------------------------------------------
        | Management / Admin
        |--------------------------------------------------------------------------
        */

        elseif (
            in_array(
                $role,
                ['Management', 'Admin'],
                true
            )
        ) {

            $filteredReviews =
                $evaluation->reviews;
        }

        /*
        |--------------------------------------------------------------------------
        | HR
        |--------------------------------------------------------------------------
        */

        elseif ($role === 'HR') {

            $filteredReviews =
                $evaluation->reviews
                    ->filter(function ($review) {

                        return in_array(
                            $review->reviewer_role,
                            [
                                'Employee',
                                'Manager',
                                'HR',
                            ],
                            true
                        );
                    })
                    ->values();
        }

        /*
        |--------------------------------------------------------------------------
        | Direct Reviewer
        |--------------------------------------------------------------------------
        */

        elseif ($isDirectReviewer) {

            $filteredReviews =
                $evaluation->reviews
                    ->filter(function ($review) use ($user) {

                        return (int)
                            $review->reviewer_id ===
                            (int) $user->id;
                    })
                    ->values();
        }

        else {

            $filteredReviews = collect();
        }


        /*
        |--------------------------------------------------------------------------
        | Replace Reviews Relation
        |--------------------------------------------------------------------------
        */

        $evaluation->setRelation(
            'reviews',
            $filteredReviews
        );


        return response()->json([
            'success' => true,
            'data' => $evaluation,
        ]);
    }


    /**
     * ================================================================
     * SUBMIT / RESUBMIT
     * ================================================================
     */
    public function submit(
        Evaluation $evaluation
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | Only Owner Can Submit
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) auth()->id()
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only submit your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Editable / Resubmittable Statuses
        |--------------------------------------------------------------------------
        */

        $editableStatuses = [
            'draft',
            'employee_rejected',
            'manager_rejected',
            'hr_rejected',
            'management_rejected',
        ];


        if (!in_array(
            $evaluation->status,
            $editableStatuses,
            true
        )) {

            return response()->json([
                'success' => false,
                'message' =>
                    'This evaluation cannot be submitted in its current status.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Get Answers
        |--------------------------------------------------------------------------
        */

        $evaluationAnswers =
            $evaluation
                ->answers()
                ->with('question')
                ->get();


        /*
        |--------------------------------------------------------------------------
        | Find Missing Required Questions
        |--------------------------------------------------------------------------
        */

        $missingRequiredQuestions =
            $evaluationAnswers
                ->filter(function ($evaluationAnswer) {

                    $question =
                        $evaluationAnswer->question;


                    /*
                    | Question no longer exists.
                    */
                    if (!$question) {
                        return false;
                    }


                    /*
                    | Optional question.
                    */
                    if (!$question->is_required) {
                        return false;
                    }


                    /*
                    | Rating is provided.
                    */
                    if (
                        $evaluationAnswer->rating !== null
                    ) {
                        return false;
                    }


                    /*
                    | Text answer is provided.
                    */
                    if (
                        $evaluationAnswer->answer !== null &&
                        trim(
                            $evaluationAnswer->answer
                        ) !== ''
                    ) {

                        return false;
                    }


                    /*
                    | Required answer is missing.
                    */
                    return true;
                })
                ->values();


        /*
        |--------------------------------------------------------------------------
        | Validation Error
        |--------------------------------------------------------------------------
        */

        if (
            $missingRequiredQuestions->count() > 0
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Please answer all required questions before submitting.',

                'missing_questions' =>
                    $missingRequiredQuestions
                        ->map(function ($evaluationAnswer) {

                            return [
                                'id' =>
                                    $evaluationAnswer
                                        ->question
                                        ->id,

                                'question' =>
                                    $evaluationAnswer
                                        ->question
                                        ->question,
                            ];
                        })
                        ->values(),

            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Submit
        |--------------------------------------------------------------------------
        */

        $evaluation->update([
            'status' =>
                'submitted',

            'submitted_at' =>
                now(),
        ]);


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Evaluation submitted successfully.',

            'data' =>
                $evaluation
                    ->fresh()
                    ->load([
                        'employee.department',
                        'employee.position',
                        'employee.role',
                        'employee.manager.role',

                        'evaluationPeriod',

                        'answers.question.category',
                        'answers.question.department',
                        'answers.question.position',
                        'answers.question.reviewers',
                    ]),
        ]);
    }


    /**
     * ================================================================
     * UPDATE EVALUATION
     * ================================================================
     */
    public function update(
        StoreEvaluationRequest $request,
        Evaluation $evaluation
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | Only Owner Can Update
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) auth()->id()
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only update your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Editable Statuses
        |--------------------------------------------------------------------------
        */

        $editableStatuses = [
            'draft',
            'employee_rejected',
            'manager_rejected',
            'hr_rejected',
            'management_rejected',
        ];


        if (!in_array(
            $evaluation->status,
            $editableStatuses,
            true
        )) {

            return response()->json([
                'success' => false,
                'message' =>
                    'This evaluation cannot be updated in its current status.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Update
        |--------------------------------------------------------------------------
        */

        $evaluation->update([
            'employee_comment' =>
                $request->employee_comment,
        ]);


        return response()->json([
            'success' => true,

            'message' =>
                'Evaluation updated successfully.',

            'data' =>
                $evaluation
                    ->fresh()
                    ->load([
                        'employee.department',
                        'employee.position',
                        'employee.role',
                        'employee.manager.role',

                        'evaluationPeriod',
                    ]),
        ]);
    }


    /**
     * ================================================================
     * DELETE DRAFT EVALUATION
     * ================================================================
     *
     * Only owner can delete.
     * Only draft evaluation can be deleted.
     */
    public function destroy(
        Evaluation $evaluation
    ): JsonResponse {

        /*
        |--------------------------------------------------------------------------
        | Only Owner Can Delete
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) auth()->id()
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only delete your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Only Draft Can Be Deleted
        |--------------------------------------------------------------------------
        */

        if (
            $evaluation->status !== 'draft'
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Only draft evaluations can be deleted.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Delete
        |--------------------------------------------------------------------------
        |
        | Delete answers first so this also works when the
        | foreign key does not have cascade delete.
        |
        */

        DB::transaction(function () use ($evaluation) {

            EvaluationAnswer::where(
                'evaluation_id',
                $evaluation->id
            )->delete();


            $evaluation->delete();
        });


        return response()->json([
            'success' => true,

            'message' =>
                'Evaluation deleted successfully.',
        ]);
    }


    /**
     * ================================================================
     * DOWNLOAD PDF
     * ================================================================
     *
     * Only HR / Management / Admin.
     */
    public function downloadPdf(
        Evaluation $evaluation
    ): Response {

        $user = auth()->user();

        $role = $user->role?->name;


        /*
        |--------------------------------------------------------------------------
        | Permission
        |--------------------------------------------------------------------------
        */

        if (!in_array(
            $role,
            ['Management', 'HR', 'Admin'],
            true
        )) {

            abort(
                403,
                'Only Management, HR, and Admin can download evaluation PDF.'
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Load Evaluation
        |--------------------------------------------------------------------------
        */

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
            'reviews.reviewer.role',
            'reviews.question.category',
            'reviews.question.reviewers',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Question Reviews
        |--------------------------------------------------------------------------
        */

        $questionReviews =
            $evaluation->reviews
                ->filter(function ($review) {

                    return !is_null(
                        $review->question_id
                    );
                })
                ->values();


        /*
        |--------------------------------------------------------------------------
        | Stage Reviews
        |--------------------------------------------------------------------------
        */

        $stageReviews =
            $evaluation->reviews
                ->filter(function ($review) {

                    return is_null(
                        $review->question_id
                    );
                })
                ->values();


        /*
        |--------------------------------------------------------------------------
        | Company Pad
        |--------------------------------------------------------------------------
        */

        $companyPadPath =
            public_path(
                'images/company-pad.png'
            );


        $companyPadBase64 = null;


        if (
            file_exists($companyPadPath)
        ) {

            $imageType =
                pathinfo(
                    $companyPadPath,
                    PATHINFO_EXTENSION
                );


            $companyPadBase64 =
                'data:image/' .
                strtolower($imageType) .
                ';base64,' .
                base64_encode(
                    file_get_contents(
                        $companyPadPath
                    )
                );
        }


        /*
        |--------------------------------------------------------------------------
        | Generate PDF
        |--------------------------------------------------------------------------
        */

        $pdf = Pdf::loadView(
            'evaluations.pdf',
            [
                'evaluation' =>
                    $evaluation,

                'companyPad' =>
                    $companyPadBase64,

                'viewerRole' =>
                    $role,

                'questionReviews' =>
                    $questionReviews,

                'stageReviews' =>
                    $stageReviews,
            ]
        );


        $pdf->setPaper(
            'a4',
            'portrait'
        );


        /*
        |--------------------------------------------------------------------------
        | File Name
        |--------------------------------------------------------------------------
        */

        $employeeName =
            $evaluation->employee->name ??
            'employee';


        $employeeName =
            preg_replace(
                '/[^A-Za-z0-9_-]/',
                '_',
                $employeeName
            );


        $periodName =
            $evaluation
                ->evaluationPeriod
                ->name ??
            'evaluation';


        $periodName =
            preg_replace(
                '/[^A-Za-z0-9_-]/',
                '_',
                $periodName
            );


        $fileName =
            'evaluation_' .
            $employeeName .
            '_' .
            $periodName .
            '.pdf';


        return $pdf->download(
            $fileName
        );
    }
}
