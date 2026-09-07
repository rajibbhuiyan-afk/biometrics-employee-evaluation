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
     * Display evaluations according to user's access.
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
        */

        if (in_array($role, ['HR', 'Management', 'Admin'], true)) {

            // Can see all evaluations.

        }

        /*
        |--------------------------------------------------------------------------
        | Employee / Manager
        |--------------------------------------------------------------------------
        */

        elseif (in_array($role, ['Employee', 'Manager'], true)) {

            $query->where(function ($q) use ($user) {

                $q->where('employee_id', $user->id)

                    ->orWhereHas('employee', function ($employeeQuery) use ($user) {

                        $employeeQuery->where(
                            'manager_id',
                            $user->id
                        );
                    });
            });

        }

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
     * Create employee's own evaluation.
     *
     * Employee / Manager / HR can create
     * their own self evaluation.
     */
    public function store(StoreEvaluationRequest $request): JsonResponse
    {
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
            | Create Evaluation
            |--------------------------------------------------------------------------
            */

            $evaluation = DB::transaction(function () use (
                $request,
                $employeeId
            ) {

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
                | Add Active Questions
                |--------------------------------------------------------------------------
                */

                $activeQuestions = EvaluationQuestion::where(
                    'status',
                    true
                )
                    ->orderBy('sort_order')
                    ->get();


                foreach ($activeQuestions as $question) {

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
            });


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
                        ]),
            ], 201);

        } catch (QueryException $e) {

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
     * Display one evaluation.
     */
    public function show(
        Evaluation $evaluation
    ): JsonResponse {

        $user = auth()->user();

        $role = $user->role?->name;


        $evaluation->loadMissing([
            'employee',
            'employee.role',
            'employee.manager',
            'employee.manager.role',
        ]);


        $isOwner =
            (int) $evaluation->employee_id ===
            (int) $user->id;


        $isDirectReviewer =
            $evaluation->employee &&
            (int) $evaluation->employee->manager_id ===
            (int) $user->id;


        /*
        |--------------------------------------------------------------------------
        | Access
        |--------------------------------------------------------------------------
        */

        if (
            in_array(
                $role,
                ['HR', 'Management', 'Admin'],
                true
            )
        ) {

            // Full access.

        }

        elseif (
            $isOwner ||
            $isDirectReviewer
        ) {

            // Allowed.

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
        | Load Evaluation Details
        |--------------------------------------------------------------------------
        */

        $evaluation->load([
            'employee.department',
            'employee.position',
            'employee.role',
            'employee.manager.role',
            'evaluationPeriod',
            'answers.question.category',
            'reviews.reviewer',
            'reviews.reviewer.role',
            'reviews.question.category',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Review Visibility
        |--------------------------------------------------------------------------
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

        elseif (
            $role === 'Management' ||
            $role === 'Admin'
        ) {

            $filteredReviews =
                $evaluation->reviews;

        }

        elseif ($role === 'HR') {

            /*
            |--------------------------------------------------------------------------
            | HR can see:
            | Employee review
            | Manager review
            | HR review
            |--------------------------------------------------------------------------
            */

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
     * Submit / resubmit employee evaluation.
     *
     * Employee / Manager / HR can submit
     * their own evaluation.
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


        if (
            !in_array(
                $evaluation->status,
                $editableStatuses,
                true
            )
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'This evaluation cannot be submitted in its current status.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Required Questions
        |--------------------------------------------------------------------------
        */

        $evaluationAnswers = $evaluation
            ->answers()
            ->with('question')
            ->get();


        $missingRequiredQuestions =
            $evaluationAnswers
                ->filter(function ($evaluationAnswer) {

                    $question =
                        $evaluationAnswer->question;


                    if (!$question) {
                        return false;
                    }


                    if (!$question->is_required) {
                        return false;
                    }


                    if (
                        $evaluationAnswer->rating !== null
                    ) {
                        return false;
                    }


                    if (
                        $evaluationAnswer->answer !== null &&
                        trim($evaluationAnswer->answer) !== ''
                    ) {
                        return false;
                    }


                    return true;
                })
                ->values();


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
        |
        | Important:
        |
        | HR's own evaluation will be routed to Management.
        |
        | Employee / Manager:
        | Their Reports To user will become
        | the first reviewer.
        |
        */

        $evaluation->update([
            'status' =>
                'submitted',

            'submitted_at' =>
                now(),
        ]);


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
                    ]),
        ]);
    }


    /**
     * Update employee evaluation.
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


        if (
            !in_array(
                $evaluation->status,
                $editableStatuses,
                true
            )
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'This evaluation cannot be updated in its current status.',
            ], 422);
        }


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
     * Delete draft evaluation.
     */
    public function destroy(
        Evaluation $evaluation
    ): JsonResponse {

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


        if (
            $evaluation->status !== 'draft'
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Only draft evaluations can be deleted.',
            ], 422);
        }


        $evaluation->delete();


        return response()->json([
            'success' => true,

            'message' =>
                'Evaluation deleted successfully.',
        ]);
    }


    /**
     * Download Evaluation PDF.
     *
     * Only HR / Management / Admin.
     */
    public function downloadPdf(
        Evaluation $evaluation
    ): Response {

        $user = auth()->user();

        $role = $user->role?->name;


        if (
            !in_array(
                $role,
                ['Management', 'HR', 'Admin'],
                true
            )
        ) {

            abort(
                403,
                'Only Management, HR, and Admin can download evaluation PDF.'
            );
        }


        $evaluation->load([
            'employee.department',
            'employee.position',
            'employee.role',
            'employee.manager.role',
            'evaluationPeriod',
            'answers.question.category',
            'reviews.reviewer',
            'reviews.reviewer.role',
            'reviews.question.category',
        ]);


        $questionReviews =
            $evaluation->reviews
                ->filter(function ($review) {

                    return !is_null(
                        $review->question_id
                    );
                })
                ->values();


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