<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEvaluationAnswerRequest;
use App\Models\Evaluation;
use App\Models\EvaluationAnswer;
use Illuminate\Http\JsonResponse;

class EvaluationAnswerController extends Controller
{
    /**
     * Display evaluation answers.
     *
     * Employee    -> Own evaluation answers
     * Manager     -> Assigned employees
     * HR          -> All answers
     * Management  -> All answers
     * Admin       -> All answers
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $query = EvaluationAnswer::with([
            'evaluation.employee.department',
            'evaluation.employee.position',
            'question.category',
        ])->latest();

        /*
        |--------------------------------------------------------------------------
        | Employee
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Employee') {

            $query->whereHas(
                'evaluation',
                function ($evaluationQuery) use ($user) {

                    $evaluationQuery->where(
                        'employee_id',
                        $user->id
                    );
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Manager
        |--------------------------------------------------------------------------
        */

        elseif ($user->role->name === 'Manager') {

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
        | HR / Management / Admin
        |--------------------------------------------------------------------------
        */

        elseif (
            in_array(
                $user->role->name,
                ['HR', 'Management', 'Admin']
            )
        ) {

            // Allowed to view all evaluation answers.
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
                    'You do not have permission to view evaluation answers.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }


    /**
     * Save an evaluation answer.
     *
     * Employee only.
     *
     * This method can be used for auto-save.
     */
    public function store(
        StoreEvaluationAnswerRequest $request
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Only Employee Can Save
        |--------------------------------------------------------------------------
        */

        if ($user->role->name !== 'Employee') {

            return response()->json([
                'success' => false,
                'message' =>
                    'Only employees can save evaluation answers.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Find Evaluation
        |--------------------------------------------------------------------------
        */

        $evaluation = Evaluation::find(
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
        | Check Ownership
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only answer your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Editable Statuses
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
                'message' =>
                    'You cannot edit answers after the evaluation has been submitted.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Find Existing Answer
        |--------------------------------------------------------------------------
        |
        | When an evaluation is created, an answer row is created
        | for every active question.
        |
        | Therefore we only update an existing answer row.
        |
        */

        $answer = EvaluationAnswer::where(
            'evaluation_id',
            $evaluation->id
        )
        ->where(
            'question_id',
            $request->question_id
        )
        ->with('question')
        ->first();

        if (!$answer) {

            return response()->json([
                'success' => false,
                'message' =>
                    'This question is not part of this evaluation.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Get Question
        |--------------------------------------------------------------------------
        */

        $question = $answer->question;

        if (!$question) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Question not found for this evaluation answer.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Maximum Answer Words
        |--------------------------------------------------------------------------
        |
        | HR controls this value when creating the question.
        |
        | Example:
        |
        | 10   -> maximum 10 words
        | 50   -> maximum 50 words
        | 100  -> maximum 100 words
        | NULL -> no word limit
        |
        */

        if (
            $question->max_answer_words !== null &&
            $request->answer !== null
        ) {

            $answerText = trim($request->answer);

            $wordCount = $answerText === ''
                ? 0
                : count(
                    preg_split(
                        '/\s+/',
                        $answerText
                    )
                );

            if (
                $wordCount >
                $question->max_answer_words
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Answer exceeds the maximum allowed word limit.',
                    'max_answer_words' =>
                        $question->max_answer_words,
                    'current_word_count' =>
                        $wordCount,
                ], 422);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Save Answer
        |--------------------------------------------------------------------------
        */

        $answer->update([
            'rating' => $request->rating,
            'answer' => $request->answer,
            'comment' => $request->comment,
        ]);


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' =>
                'Evaluation answer saved successfully.',
            'data' => $answer
                ->fresh()
                ->load([
                    'evaluation',
                    'question.category',
                ]),
        ]);
    }


    /**
     * Display a single evaluation answer.
     */
    public function show(
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {

        $user = auth()->user();

        $evaluationAnswer->load([
            'evaluation.employee.department',
            'evaluation.employee.position',
            'question.category',
        ]);

        $evaluation = $evaluationAnswer->evaluation;


        /*
        |--------------------------------------------------------------------------
        | Employee
        |--------------------------------------------------------------------------
        */

        if ($user->role->name === 'Employee') {

            if (
                !$evaluation ||
                (int) $evaluation->employee_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You can only view answers from your own evaluation.',
                ], 403);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Manager
        |--------------------------------------------------------------------------
        */

        elseif ($user->role->name === 'Manager') {

            if (
                !$evaluation ||
                !$evaluation->employee ||
                (int) $evaluation->employee->manager_id !==
                (int) $user->id
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'You can only view answers of your assigned employees.',
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
                'message' =>
                    'You do not have permission to view this answer.',
            ], 403);
        }


        return response()->json([
            'success' => true,
            'data' => $evaluationAnswer,
        ]);
    }


    /**
     * Update an existing evaluation answer.
     *
     * Employee only.
     *
     * This method can also be used for auto-save.
     */
    public function update(
        StoreEvaluationAnswerRequest $request,
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {

        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | Only Employee Can Update
        |--------------------------------------------------------------------------
        */

        if ($user->role->name !== 'Employee') {

            return response()->json([
                'success' => false,
                'message' =>
                    'Only employees can update evaluation answers.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Load Evaluation and Question
        |--------------------------------------------------------------------------
        */

        $evaluationAnswer->load([
            'evaluation',
            'question',
        ]);

        $evaluation = $evaluationAnswer->evaluation;

        if (!$evaluation) {

            return response()->json([
                'success' => false,
                'message' => 'Evaluation not found.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Check Ownership
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only update answers from your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Editable Statuses
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
                'message' =>
                    'You cannot update answers after the evaluation has been submitted.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Make Sure Answer Belongs To Evaluation
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluationAnswer->evaluation_id !==
            (int) $evaluation->id
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'This answer does not belong to the evaluation.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Question Must Exist
        |--------------------------------------------------------------------------
        */

        $question = $evaluationAnswer->question;

        if (!$question) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Question not found for this evaluation answer.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Maximum Answer Words
        |--------------------------------------------------------------------------
        */

        if (
            $question->max_answer_words !== null &&
            $request->answer !== null
        ) {

            $answerText = trim($request->answer);

            $wordCount = $answerText === ''
                ? 0
                : count(
                    preg_split(
                        '/\s+/',
                        $answerText
                    )
                );

            if (
                $wordCount >
                $question->max_answer_words
            ) {

                return response()->json([
                    'success' => false,
                    'message' =>
                        'Answer exceeds the maximum allowed word limit.',
                    'max_answer_words' =>
                        $question->max_answer_words,
                    'current_word_count' =>
                        $wordCount,
                ], 422);
            }
        }


        /*
        |--------------------------------------------------------------------------
        | Update Answer
        |--------------------------------------------------------------------------
        */

        $evaluationAnswer->update([
            'rating' => $request->rating,
            'answer' => $request->answer,
            'comment' => $request->comment,
        ]);


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' =>
                'Evaluation answer updated successfully.',
            'data' => $evaluationAnswer
                ->fresh()
                ->load([
                    'evaluation',
                    'question.category',
                ]),
        ]);
    }


    /**
     * Clear an evaluation answer.
     *
     * We do NOT delete the row because every question
     * has an answer row created when the evaluation starts.
     */
    public function destroy(
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {

        $user = auth()->user();


        /*
        |--------------------------------------------------------------------------
        | Only Employee
        |--------------------------------------------------------------------------
        */

        if ($user->role->name !== 'Employee') {

            return response()->json([
                'success' => false,
                'message' =>
                    'Only employees can clear their evaluation answers.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Load Evaluation
        |--------------------------------------------------------------------------
        */

        $evaluationAnswer->load('evaluation');

        $evaluation = $evaluationAnswer->evaluation;

        if (!$evaluation) {

            return response()->json([
                'success' => false,
                'message' => 'Evaluation not found.',
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | Ownership
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only clear answers from your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Editable Statuses
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
                'message' =>
                    'You cannot clear answers after the evaluation has been submitted.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Clear Instead Of Delete
        |--------------------------------------------------------------------------
        */

        $evaluationAnswer->update([
            'rating' => null,
            'answer' => null,
            'comment' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Evaluation answer cleared successfully.',
        ]);
    }
}