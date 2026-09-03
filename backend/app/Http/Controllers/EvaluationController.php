<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationRequest;
use App\Models\Evaluation;
use App\Models\EvaluationAnswer;
use App\Models\EvaluationQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\QueryException;
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

            /*
            |--------------------------------------------------------------
            | These roles can see all evaluations.
            |--------------------------------------------------------------
            */
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
            |--------------------------------------------------------------------------
            | Check duplicate evaluation
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
            | Create Evaluation + Answer Rows
            |--------------------------------------------------------------------------
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
            |--------------------------------------------------------------------------
            | Return Evaluation
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
                            'evaluationPeriod',
                            'answers.question.category',
                        ]),
            ], 201);

        } catch (QueryException $e) {

            /*
            |--------------------------------------------------------------------------
            | Duplicate Evaluation Protection
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
        |--------------------------------------------------------------------------
        | Employee Access
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Manager Access
        |--------------------------------------------------------------------------
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

            /*
            |--------------------------------------------------------------
            | Allowed.
            |--------------------------------------------------------------
            */
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
                    'You do not have permission to view this evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Load Employee + Evaluation Data
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Filter Review Visibility
        |--------------------------------------------------------------------------
        |
        | VERY IMPORTANT
        |
        | Review data is filtered on backend.
        |
        | Manager:
        |   Manager only
        |
        | HR:
        |   HR only
        |
        | Management:
        |   Manager + HR + Management
        |
        | Admin:
        |   Manager + HR + Management
        |
        | Employee:
        |   No review
        |
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

            /*
            |--------------------------------------------------------------
            | Employee must never see reviewer data.
            |--------------------------------------------------------------
            */

            $allowedReviewRoles = [];
        }


        /*
        |--------------------------------------------------------------------------
        | Filter Reviews
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Replace Original Reviews Relation
        |--------------------------------------------------------------------------
        */

        $evaluation->setRelation(
            'reviews',
            $filteredReviews
        );


        /*
        |--------------------------------------------------------------------------
        | Return Evaluation
        |--------------------------------------------------------------------------
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
        | Allowed Statuses
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Get Questions Belonging To Evaluation
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
                ->filter(
                    function ($evaluationAnswer) {

                        $question =
                            $evaluationAnswer->question;


                        /*
                        |------------------------------------------------------
                        | Deleted Question
                        |------------------------------------------------------
                        */

                        if (!$question) {
                            return false;
                        }


                        /*
                        |------------------------------------------------------
                        | Optional Question
                        |------------------------------------------------------
                        */

                        if (
                            !$question->is_required
                        ) {

                            return false;
                        }


                        /*
                        |------------------------------------------------------
                        | Rating Answer
                        |------------------------------------------------------
                        */

                        if (
                            $evaluationAnswer->rating !==
                            null
                        ) {

                            return false;
                        }


                        /*
                        |------------------------------------------------------
                        | Text Answer
                        |------------------------------------------------------
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


                        /*
                        |------------------------------------------------------
                        | Required Question Missing
                        |------------------------------------------------------
                        */

                        return true;
                    }
                )
                ->values();


        /*
        |--------------------------------------------------------------------------
        | Required Question Missing
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Submit / Resubmit
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
        | Return Updated Evaluation
        |--------------------------------------------------------------------------
        |
        | Employee should NOT receive reviewer data.
        |
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
        | Allowed Statuses
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Update Employee Comment
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
}