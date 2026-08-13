<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(): JsonResponse
    {
        $users = User::with([
            'role',
            'department',
            'position',
        ])
        ->latest()
        ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],

            'role_id' => [
                'required',
                'integer',
                'exists:roles,id',
            ],

            'department_id' => [
                'nullable',
                'integer',
                'exists:departments,id',
            ],

            'position_id' => [
                'nullable',
                'integer',
                'exists:positions,id',
            ],

            'status' => [
                'nullable',
                'boolean',
            ],
        ]);

        $validated['password'] = Hash::make(
            $validated['password']
        );

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => $user->load([
                'role',
                'department',
                'position',
            ]),
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        $user->load([
            'role',
            'department',
            'position',
            'evaluations.evaluationPeriod',
            'reviews.evaluation',
        ]);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(
        Request $request,
        User $user
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],

            'role_id' => [
                'required',
                'integer',
                'exists:roles,id',
            ],

            'department_id' => [
                'nullable',
                'integer',
                'exists:departments,id',
            ],

            'position_id' => [
                'nullable',
                'integer',
                'exists:positions,id',
            ],

            'status' => [
                'nullable',
                'boolean',
            ],
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make(
                $validated['password']
            );
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => $user->load([
                'role',
                'department',
                'position',
            ]),
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->evaluations()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete this user because evaluation records exist.',
            ], 409);
        }

        if ($user->reviews()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete this user because review records exist.',
            ], 409);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }
}