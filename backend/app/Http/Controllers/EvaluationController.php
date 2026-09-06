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
     * Display evaluations according to logged-in user's role.
     *
     * Employee   -> Own evaluations only
     * Manager    -> Assigned employees only
     * HR         -> All evaluations
     * Management -> All evaluations
     * Admin      -> All evaluations
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $role = $user->role->name;

        $query = Evaluation::with([
            'employee.department',
            'employee.position',
            'evaluationPeriod',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | Employee
        |--------------------------------------------------------------------------
        */

        if ($role === 'Employee') {

            $query->where(
                'employee_id',
                $user->id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Manager
        |--------------------------------------------------------------------------
        */

        elseif ($role === 'Manager') {

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
        | HR / Management / Admin
        |--------------------------------------------------------------------------
        */

        elseif (
            in_array(
                $role,
                ['HR', 'Management', 'Admin']
            )
        ) {

            // These roles can see all evaluations.
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
     * Create a new evaluation.
     *
     * Employee only.
     */
    public function store(
        StoreEvaluationRequest $request
    ): JsonResponse {

        try {

            $employeeId = auth()->id();

            /*
            |----------------------------------------------------------------------
            | Check duplicate evaluation
            |----------------------------------------------------------------------
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
            |----------------------------------------------------------------------
            | Create Evaluation + Answer Rows
            |----------------------------------------------------------------------
            */

            $evaluation = DB::transaction(function () use (
                $request,
                $employeeId
            ) {

                /*
                |------------------------------------------------------------------
                | Create Evaluation
                |------------------------------------------------------------------
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
                |------------------------------------------------------------------
                | Get Active Questions
                |------------------------------------------------------------------
                */

                $activeQuestions =
                    EvaluationQuestion::where(
                        'status',
                        true
                    )
                    ->orderBy(
                        'sort_order'
                    )
                    ->get();


                /*
                |------------------------------------------------------------------
                | Create Empty Answer Row
                |------------------------------------------------------------------
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
            });


            /*
            |----------------------------------------------------------------------
            | Return Evaluation
            |----------------------------------------------------------------------
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
                            'evaluationPeriod',
                            'answers.question.category',
                        ]),
            ], 201);

        } catch (QueryException $e) {

            /*
            |----------------------------------------------------------------------
            | Duplicate Evaluation Protection
            |----------------------------------------------------------------------
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
     * Display a single evaluation.
     *
     * Employee   -> Own evaluation + NO reviews
     * Manager    -> Assigned employee + Manager reviews only
     * HR         -> All + HR reviews only
     * Management -> All + Manager + HR + Management reviews
     * Admin      -> All + all reviews
     */
    public function show(
        Evaluation $evaluation
    ): JsonResponse {

        $user = auth()->user();

        $role = $user->role->name;


        /*
        |----------------------------------------------------------------------
        | Employee Access
        |----------------------------------------------------------------------
        */

        if ($role === 'Employee') {

            if (
                (int) $evaluation->employee_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You can only view your own evaluation.',
                ], 403);
            }
        }


        /*
        |----------------------------------------------------------------------
        | Manager Access
        |----------------------------------------------------------------------
        */

        elseif ($role === 'Manager') {

            $evaluation->loadMissing(
                'employee'
            );

            if (
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You can only view evaluations of your assigned employees.',
                ], 403);
            }
        }


        /*
        |----------------------------------------------------------------------
        | HR / Management / Admin
        |----------------------------------------------------------------------
        */

        elseif (
            in_array(
                $role,
                ['HR', 'Management', 'Admin']
            )
        ) {

            // Allowed.
        }


        /*
        |----------------------------------------------------------------------
        | Unknown Role
        |----------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' =>
                    'You do not have permission to view this evaluation.',
            ], 403);
        }


        /*
        |----------------------------------------------------------------------
        | Load Employee + Evaluation Data
        |----------------------------------------------------------------------
        */

        $evaluation->load([
            'employee.department',
            'employee.position',
            'evaluationPeriod',
            'answers.question.category',
            'reviews.reviewer',
            'reviews.question.category',
        ]);


        /*
        |----------------------------------------------------------------------
        | Filter Review Visibility
        |----------------------------------------------------------------------
        */

        $allowedReviewRoles = [];

        if ($role === 'Manager') {

            $allowedReviewRoles = [
                'Manager',
            ];
        }

        elseif ($role === 'HR') {

            $allowedReviewRoles = [
                'HR',
            ];
        }

        elseif ($role === 'Management') {

            $allowedReviewRoles = [
                'Manager',
                'HR',
                'Management',
            ];
        }

        elseif ($role === 'Admin') {

            $allowedReviewRoles = [
                'Manager',
                'HR',
                'Management',
            ];
        }

        elseif ($role === 'Employee') {

            $allowedReviewRoles = [];
        }


        /*
        |----------------------------------------------------------------------
        | Filter Reviews
        |----------------------------------------------------------------------
        */

        $filteredReviews = $evaluation->reviews
            ->filter(
                function ($review) use (
                    $allowedReviewRoles
                ) {

                    return in_array(
                        $review->reviewer_role,
                        $allowedReviewRoles,
                        true
                    );
                }
            )
            ->values();


        /*
        |----------------------------------------------------------------------
        | Replace Original Reviews Relation
        |----------------------------------------------------------------------
        */

        $evaluation->setRelation(
            'reviews',
            $filteredReviews
        );


        /*
        |----------------------------------------------------------------------
        | Return Evaluation
        |----------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'data' => $evaluation,
        ]);
    }


    /**
     * Employee submits / resubmits evaluation.
     *
     * Allowed:
     *
     * draft
     * manager_returned
     * manager_rejected
     * hr_returned
     * hr_rejected
     * management_returned
     * management_rejected
     */
    public function submit(
        Evaluation $evaluation
    ): JsonResponse {

        /*
        |----------------------------------------------------------------------
        | Only Owner Can Submit
        |----------------------------------------------------------------------
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
        |----------------------------------------------------------------------
        | Allowed Statuses
        |----------------------------------------------------------------------
        */

        $editableStatuses = [
            'draft',

            'manager_returned',
            'manager_rejected',

            'hr_returned',
            'hr_rejected',

            'management_returned',
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
        |----------------------------------------------------------------------
        | Get Questions Belonging To Evaluation
        |----------------------------------------------------------------------
        */

        $evaluationAnswers =
            $evaluation
                ->answers()
                ->with('question')
                ->get();


        /*
        |----------------------------------------------------------------------
        | Find Missing Required Questions
        |----------------------------------------------------------------------
        */

        $missingRequiredQuestions =
            $evaluationAnswers
                ->filter(
                    function ($evaluationAnswer) {

                        $question =
                            $evaluationAnswer->question;


                        /*
                        |------------------------------------------------------------------
                        | Deleted Question
                        |------------------------------------------------------------------
                        */

                        if (!$question) {
                            return false;
                        }


                        /*
                        |------------------------------------------------------------------
                        | Optional Question
                        |------------------------------------------------------------------
                        */

                        if (
                            !$question->is_required
                        ) {

                            return false;
                        }


                        /*
                        |------------------------------------------------------------------
                        | Rating Answer
                        |------------------------------------------------------------------
                        */

                        if (
                            $evaluationAnswer->rating !==
                            null
                        ) {

                            return false;
                        }


                        /*
                        |------------------------------------------------------------------
                        | Text Answer
                        |------------------------------------------------------------------
                        */

                        if (
                            $evaluationAnswer->answer !==
                                null &&
                            trim(
                                $evaluationAnswer->answer
                            ) !== ''
                        ) {

                            return false;
                        }


                        return true;
                    }
                )
                ->values();


        /*
        |----------------------------------------------------------------------
        | Required Question Missing
        |----------------------------------------------------------------------
        */

        if (
            $missingRequiredQuestions->count() >
            0
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Please answer all required questions before submitting.',

                'missing_questions' =>
                    $missingRequiredQuestions
                        ->map(
                            function (
                                $evaluationAnswer
                            ) {

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
                            }
                        )
                        ->values(),
            ], 422);
        }


        /*
        |----------------------------------------------------------------------
        | Submit / Resubmit
        |----------------------------------------------------------------------
        */

        $evaluation->update([
            'status' =>
                'submitted',

            'submitted_at' =>
                now(),
        ]);


        /*
        |----------------------------------------------------------------------
        | Return Updated Evaluation
        |----------------------------------------------------------------------
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
                        'evaluationPeriod',
                        'answers.question.category',
                    ]),
        ]);
    }


    /**
     * Employee can update evaluation comment.
     *
     * Allowed:
     *
     * draft
     * manager_returned
     * manager_rejected
     * hr_returned
     * hr_rejected
     * management_returned
     * management_rejected
     */
    public function update(
        StoreEvaluationRequest $request,
        Evaluation $evaluation
    ): JsonResponse {

        /*
        |----------------------------------------------------------------------
        | Only Owner Can Update
        |----------------------------------------------------------------------
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
        |----------------------------------------------------------------------
        | Allowed Statuses
        |----------------------------------------------------------------------
        */

        $editableStatuses = [
            'draft',

            'manager_returned',
            'manager_rejected',

            'hr_returned',
            'hr_rejected',

            'management_returned',
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


        /*
        |----------------------------------------------------------------------
        | Update Employee Comment
        |----------------------------------------------------------------------
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
                        'evaluationPeriod',
                    ]),
        ]);
    }


    /**
     * Delete evaluation.
     *
     * Only draft evaluation can be deleted.
     */
    public function destroy(
        Evaluation $evaluation
    ): JsonResponse {

        /*
        |----------------------------------------------------------------------
        | Only Owner Can Delete
        |----------------------------------------------------------------------
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
        |----------------------------------------------------------------------
        | Only Draft Can Be Deleted
        |----------------------------------------------------------------------
        */

        if (
            $evaluation->status !==
            'draft'
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
     * Management only.
     *
     * IMPORTANT:
     * This method is separate from index(), show(), store(),
     * submit(), update() and destroy().
     *
     * So existing evaluation functionality remains unchanged.
     */
    public function downloadPdf(
        Evaluation $evaluation
    ): Response {

        $user = auth()->user();

        $role = $user->role->name;


        /*
        |----------------------------------------------------------------------
        | MANAGEMENT ONLY
        |----------------------------------------------------------------------
        */

        if ($role !== 'Management' && $role !== 'HR' && $role !== 'Admin') {

            abort(
                403,
                'Only Management, HR, and Admin can download evaluation PDF.'
            );
        }


        /*
        |----------------------------------------------------------------------
        | Load Everything Required For PDF
        |----------------------------------------------------------------------
        */

        $evaluation->load([
            'employee.department',
            'employee.position',
            'evaluationPeriod',
            'answers.question.category',
            'reviews.reviewer',
            'reviews.question.category',
        ]);


        /*
        |----------------------------------------------------------------------
        | Question Level Reviews
        |----------------------------------------------------------------------
        |
        | question_id != null
        |
        */

        $questionReviews = $evaluation->reviews
            ->filter(function ($review) {

                return !is_null(
                    $review->question_id
                );
            })
            ->values();


        /*
        |----------------------------------------------------------------------
        | Stage Level Reviews
        |----------------------------------------------------------------------
        |
        | question_id == null
        |
        */

        $stageReviews = $evaluation->reviews
            ->filter(function ($review) {

                return is_null(
                    $review->question_id
                );
            })
            ->values();


        /*
        |----------------------------------------------------------------------
        | Company Pad
        |----------------------------------------------------------------------
        |
        | File:
        | public/images/company-pad.png
        |
        */

        $companyPadPath =
            public_path(
                'images/company-pad.png'
            );

        $companyPadBase64 = null;

        if (
            file_exists(
                $companyPadPath
            )
        ) {

            $imageType =
                pathinfo(
                    $companyPadPath,
                    PATHINFO_EXTENSION
                );

            $companyPadBase64 =
                'data:image/' .
                strtolower(
                    $imageType
                ) .
                ';base64,' .
                base64_encode(
                    file_get_contents(
                        $companyPadPath
                    )
                );
        }


        /*
        |----------------------------------------------------------------------
        | Generate PDF
        |----------------------------------------------------------------------
        */

        $pdf = Pdf::loadView(
            'evaluations.pdf',
            [
                'evaluation' =>
                    $evaluation,

                'companyPad' =>
                    $companyPadBase64,

                'viewerRole' =>
                    'Management',

                'questionReviews' =>
                    $questionReviews,

                'stageReviews' =>
                    $stageReviews,
            ]
        );


        /*
        |----------------------------------------------------------------------
        | A4 Portrait
        |----------------------------------------------------------------------
        */

        $pdf->setPaper(
            'a4',
            'portrait'
        );


        /*
        |----------------------------------------------------------------------
        | Generate Safe Filename
        |----------------------------------------------------------------------
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


        /*
        |----------------------------------------------------------------------
        | Download PDF
        |----------------------------------------------------------------------
        */

        return $pdf->download(
            $fileName
        );
    }
}
