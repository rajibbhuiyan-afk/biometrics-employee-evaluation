<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\EvaluationAnswer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EvaluationAnswerController extends Controller
{
    /**
     * Display evaluation answers.
     *
     * HR / Management / Admin:
     *     Can view all evaluation answers.
     *
     * Employee / Manager:
     *     Can view their own answers and
     *     answers of their direct reports.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $role = $user->role?->name;

        $query = EvaluationAnswer::with([
            'evaluation.employee.department',
            'evaluation.employee.position',
            'evaluation.employee.role',
            'evaluation.employee.manager.role',
            'question.category',
        ]);

        /*
        |--------------------------------------------------------------------------
        | HR / Management / Admin
        |--------------------------------------------------------------------------
        */

        if (in_array($role, ['HR', 'Management', 'Admin'], true)) {

            // Full access.

        }

        /*
        |--------------------------------------------------------------------------
        | Employee / Manager
        |--------------------------------------------------------------------------
        */

        elseif (in_array($role, ['Employee', 'Manager'], true)) {

            $query->whereHas(
                'evaluation',
                function ($evaluationQuery) use ($user) {

                    $evaluationQuery
                        ->where(
                            'employee_id',
                            $user->id
                        )
                        ->orWhereHas(
                            'employee',
                            function ($employeeQuery) use ($user) {

                                $employeeQuery->where(
                                    'manager_id',
                                    $user->id
                                );
                            }
                        );
                }
            );

        }

        /*
        |--------------------------------------------------------------------------
        | Other Roles
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
            'data' => $query
                ->latest()
                ->get(),
        ]);
    }


    /**
     * Create / Save an evaluation answer.
     *
     * Used by autosave from EvaluationDetails.jsx.
     *
     * Allowed:
     *     Employee
     *     Manager
     *     HR
     *
     * Important:
     *     User can save ONLY their own evaluation.
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Authentication
        |--------------------------------------------------------------------------
        */

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }


        /*
        |--------------------------------------------------------------------------
        | Role Permission
        |--------------------------------------------------------------------------
        |
        | HR must also be able to create/save their own
        | self-evaluation.
        |
        */

        $allowedRoles = [
            'Employee',
            'Manager',
            'HR',
        ];

        $userRole = $user->role?->name;

        if (!in_array($userRole, $allowedRoles, true)) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You do not have permission to save evaluation answers.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $validator = Validator::make(
            $request->all(),
            [
                'evaluation_id' => [
                    'required',
                    'integer',
                    'exists:evaluations,id',
                ],

                'question_id' => [
                    'required',
                    'integer',
                    'exists:evaluation_questions,id',
                ],

                'answer' => [
                    'nullable',
                    'string',
                ],

                'rating' => [
                    'nullable',
                    'numeric',
                    'min:0',
                    'max:10',
                ],

                'comment' => [
                    'nullable',
                    'string',
                ],
            ]
        );


        if ($validator->fails()) {

            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Find Evaluation
        |--------------------------------------------------------------------------
        */

        $evaluation = Evaluation::with([
            'employee',
            'employee.role',
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
        | OWNER CHECK
        |--------------------------------------------------------------------------
        |
        | Employee:
        |     own evaluation
        |
        | Manager:
        |     own evaluation
        |
        | HR:
        |     own evaluation
        |
        | Nobody can modify another employee's answers.
        |
        */

        if (
            (int) $evaluation->employee_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only save answers for your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Editable Evaluation Statuses
        |--------------------------------------------------------------------------
        |
        | Employee can edit after rejection and resubmit.
        |
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
                    'This evaluation cannot be edited in its current status.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Find Existing Answer
        |--------------------------------------------------------------------------
        |
        | One evaluation + one question = one answer.
        |
        */

        $evaluationAnswer = EvaluationAnswer::where(
            'evaluation_id',
            $evaluation->id
        )
            ->where(
                'question_id',
                $request->question_id
            )
            ->first();


        /*
        |--------------------------------------------------------------------------
        | Create New Answer
        |--------------------------------------------------------------------------
        */

        if (!$evaluationAnswer) {

            $evaluationAnswer = EvaluationAnswer::create([
                'evaluation_id' =>
                    $evaluation->id,

                'question_id' =>
                    $request->question_id,

                'answer' =>
                    $request->input('answer'),

                'rating' =>
                    $request->input('rating'),

                'comment' =>
                    $request->input('comment'),
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | Update Existing Answer
        |--------------------------------------------------------------------------
        */

        else {

            $evaluationAnswer->update([
                'answer' =>
                    $request->input('answer'),

                'rating' =>
                    $request->input('rating'),

                'comment' =>
                    $request->input('comment'),
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' =>
                'Evaluation answer saved successfully.',

            'data' =>
                $evaluationAnswer
                    ->fresh()
                    ->load([
                        'evaluation.employee',
                        'question.category',
                    ]),
        ], 200);
    }


    /**
     * Display a single evaluation answer.
     */
    public function show(
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {

        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $role = $user->role?->name;

        $evaluationAnswer->load([
            'evaluation.employee',
            'evaluation.employee.department',
            'evaluation.employee.position',
            'evaluation.employee.role',
            'evaluation.employee.manager.role',
            'question.category',
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
        | Owner
        |--------------------------------------------------------------------------
        */

        $isOwner =
            (int) $evaluation->employee_id ===
            (int) $user->id;


        /*
        |--------------------------------------------------------------------------
        | Direct Reviewer
        |--------------------------------------------------------------------------
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

        if (
            in_array(
                $role,
                ['HR', 'Management', 'Admin'],
                true
            )
        ) {

            // Allowed.

        } elseif (
            $isOwner ||
            $isDirectReviewer
        ) {

            // Allowed.

        } else {

            return response()->json([
                'success' => false,
                'message' =>
                    'You do not have permission to view this evaluation answer.',
            ], 403);
        }


        return response()->json([
            'success' => true,
            'data' => $evaluationAnswer,
        ]);
    }


    /**
     * Update an evaluation answer.
     *
     * Employee / Manager / HR:
     *     Own evaluation only.
     */
    public function update(
        Request $request,
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {

        $user = auth()->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }


        /*
        |--------------------------------------------------------------------------
        | Role Permission
        |--------------------------------------------------------------------------
        */

        $allowedRoles = [
            'Employee',
            'Manager',
            'HR',
        ];

        $userRole = $user->role?->name;

        if (!in_array($userRole, $allowedRoles, true)) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You do not have permission to update evaluation answers.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Load Evaluation
        |--------------------------------------------------------------------------
        */

        $evaluationAnswer->load([
            'evaluation.employee',
            'evaluation.employee.role',
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
        | Owner Check
        |--------------------------------------------------------------------------
        */

        if (
            (int) $evaluation->employee_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' =>
                    'You can only update answers for your own evaluation.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Editable Status
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
                    'This evaluation cannot be edited in its current status.',
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        $validator = Validator::make(
            $request->all(),
            [
                'answer' => [
                    'nullable',
                    'string',
                ],

                'rating' => [
                    'nullable',
                    'numeric',
                    'min:0',
                    'max:10',
                ],

                'comment' => [
                    'nullable',
                    'string',
                ],
            ]
        );


        if ($validator->fails()) {

            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | Update
        |--------------------------------------------------------------------------
        */

        $evaluationAnswer->update([
            'answer' =>
                $request->input('answer'),

            'rating' =>
                $request->input('rating'),

            'comment' =>
                $request->input('comment'),
        ]);


        return response()->json([
            'success' => true,
            'message' =>
                'Evaluation answer updated successfully.',

            'data' =>
                $evaluationAnswer
                    ->fresh()
                    ->load([
                        'evaluation.employee',
                        'question.category',
                    ]),
        ]);
    }


    /**
     * Delete evaluation answer.
     *
     * Evaluation answers should not be deleted.
     */
    public function destroy(
        EvaluationAnswer $evaluationAnswer
    ): JsonResponse {

        return response()->json([
            'success' => false,
            'message' =>
                'Evaluation answers cannot be deleted.',
        ], 422);
    }
}