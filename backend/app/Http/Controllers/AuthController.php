<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
            ],
        ]);

        $user = User::with([
            'role',
            'department',
            'position',
        ])
        ->where('email', $validated['email'])
        ->first();

        if (!$user || !Hash::check(
            $validated['password'],
            $user->password
        )) {
            throw ValidationException::withMessages([
                'email' => [
                    'The provided credentials are incorrect.',
                ],
            ]);
        }

        // Check user status
        if (isset($user->status) && !$user->status) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is inactive.',
            ], 403);
        }

        // Delete old tokens
        $user->tokens()->delete();

        // Create new token
        $token = $user->createToken(
            'employee-evaluation-token'
        )->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',

            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ],
        ]);
    }


    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'role',
            'department',
            'position',
        ]);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }


    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful.',
        ]);
    }
}