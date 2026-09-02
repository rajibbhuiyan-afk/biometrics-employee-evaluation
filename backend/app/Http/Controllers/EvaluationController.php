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

        if ($user->role->name === 'Employee') {

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

        elseif ($user->role->name === 'Manager') {

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
                $user->role->name,
                ['HR', 'Management', 'Admin']
            )
        ) {

            // Allowed to see all evaluations.
        }

        /*
        |--------------------------------------------------------------------------
        | Unknown Role
        |--------------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view evaluations.',
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
     *
     * When an evaluation is created, all currently active
     * questions are attached to the evaluation as empty
     * EvaluationAnswer records.
     *
     * This creates a stable question set for the evaluation.
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
                    'message' => 'You already have an evaluation for this period.',
                ], 409);
            }


            /*
            |--------------------------------------------------------------------------
            | Create evaluation + answer rows
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
                    'employee_id' => $employeeId,
                    'evaluation_period_id' => $request->evaluation_period_id,
                    'status' => 'draft',
                    'employee_comment' => $request->employee_comment,
                ]);


                /*
                |------------------------------------------------------------------
                | Get currently active questions
                |------------------------------------------------------------------
                |
                | These questions become part of this evaluation.
                |
                */

                $activeQuestions = EvaluationQuestion::where(
                    'status',
                    true
                )
                ->orderBy('sort_order')
                ->get();


                /*
                |------------------------------------------------------------------
                | Create empty answer for every active question
                |------------------------------------------------------------------
                |
                | This is important because:
                |
                | - Optional unanswered questions must still appear in review.
                | - Question status changes later won't remove them.
                | - Auto-save can update an existing answer row.
                |
                */

                foreach ($activeQuestions as $question) {

                    EvaluationAnswer::create([
                        'evaluation_id' => $evaluation->id,
                        'question_id' => $question->id,
                        'rating' => null,
                        'answer' => null,
                        'comment' => null,
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
                'message' => 'Evaluation created successfully.',
                'data' => $evaluation
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
                    'message' => 'This employee already has an evaluation for this period.',
                ], 409);
            }

            throw $e;
        }
    }


    /**
     * Display a single evaluation.
     *
     * Employee   -> Own evaluation
     * Manager    -> Assigned employee
     * HR         -> All
     * Management -> All
     * Admin      -> All
     */
    public function show(
        Evaluation $evaluation
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Employee Access
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Employee') {

            if (
                (int) $evaluation->employee_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'You can only view your own evaluation.',
                ], 403);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Manager Access
        |--------------------------------------------------------------------------
        */

        elseif ($user->role->name === 'Manager') {

            $evaluation->loadMissing('employee');

            if (
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' => 'You can only view evaluations of your assigned employees.',
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
                $user->role->name,
                ['HR', 'Management', 'Admin']
            )
        ) {

            // Allowed.
        }

        /*
        |--------------------------------------------------------------------------
        | Unknown Role
        |--------------------------------------------------------------------------
        */

        else {

            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Load Complete Evaluation
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
                'message' => 'You can only submit your own evaluation.',
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

        if (!in_array(
            $evaluation->status,
            $editableStatuses
        )) {

            return response()->json([
                'success' => false,
                'message' => 'This evaluation cannot be submitted in its current status.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Get Questions Belonging To This Evaluation
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | Do NOT query current active questions here.
        |
        | EvaluationAnswer records were created when the evaluation
        | was created. Therefore they represent the question set
        | belonging to this evaluation.
        |
        */

        $evaluationAnswers = $evaluation
            ->answers()
            ->with('question')
            ->get();


        /*
        |--------------------------------------------------------------------------
        | Find Missing Required Questions
        |--------------------------------------------------------------------------
        */

        $missingRequiredQuestions = $evaluationAnswers
            ->filter(function ($evaluationAnswer) {

                $question = $evaluationAnswer->question;

                /*
                |--------------------------------------------------------------
                | If question was deleted somehow, ignore it here.
                |--------------------------------------------------------------
                */

                if (!$question) {
                    return false;
                }

                /*
                |--------------------------------------------------------------
                | Only required questions need an answer.
                |--------------------------------------------------------------
                */

                if (!$question->is_required) {
                    return false;
                }

                /*
                |--------------------------------------------------------------
                | Rating answer
                |--------------------------------------------------------------
                */

                if (
                    $evaluationAnswer->rating !== null
                ) {

                    return false;
                }

                /*
                |--------------------------------------------------------------
                | Text answer
                |--------------------------------------------------------------
                */

                if (
                    $evaluationAnswer->answer !== null &&
                    trim($evaluationAnswer->answer) !== ''
                ) {

                    return false;
                }

                /*
                |--------------------------------------------------------------
                | Required question is unanswered
                |--------------------------------------------------------------
                */

                return true;
            })
            ->values();


        /*
        |--------------------------------------------------------------------------
        | Required Question Missing
        |--------------------------------------------------------------------------
        */

        if ($missingRequiredQuestions->count() > 0) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Please answer all required questions before submitting.',

                'missing_questions' =>
                    $missingRequiredQuestions
                        ->map(function ($evaluationAnswer) {

                            return [
                                'id' =>
                                    $evaluationAnswer->question->id,

                                'question' =>
                                    $evaluationAnswer->question->question,
                            ];
                        }),
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Submit / Resubmit
        |--------------------------------------------------------------------------
        */

        $evaluation->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);


        /*
        |--------------------------------------------------------------------------
        | Return Updated Evaluation
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
                        'evaluationPeriod',
                        'answers.question.category',
                        'reviews.reviewer',
                        'reviews.question.category',
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
                'message' => 'You can only update your own evaluation.',
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

        if (!in_array(
            $evaluation->status,
            $editableStatuses
        )) {

            return response()->json([
                'success' => false,
                'message' => 'This evaluation cannot be updated in its current status.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Update Employee Comment
        |--------------------------------------------------------------------------
        */

        $evaluation->update([
            'employee_comment' => $request->employee_comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evaluation updated successfully.',

            'data' => $evaluation
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
                'message' => 'You can only delete your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Only Draft Can Be Deleted
        |--------------------------------------------------------------------------
        */

        if ($evaluation->status !== 'draft') {

            return response()->json([
                'success' => false,
                'message' => 'Only draft evaluations can be deleted.',
            ], 422);
        }


        $evaluation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation deleted successfully.',
        ]);
    }
}