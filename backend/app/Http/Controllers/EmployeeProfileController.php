<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateEmployeeProfileRequest;
use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class EmployeeProfileController extends Controller
{
    /**
     * Display logged-in employee profile.
     */
    public function show(): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        $user->load([
            'employeeProfile',
            'educations',
            'department',
            'position',
            'manager',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'profile' => $user->employeeProfile,
                'educations' => $user->educations,
            ],
        ]);
    }

    /**
     * Display another employee profile.
     * (HR / Manager / Admin only)
     */
    public function showEmployee(User $user): JsonResponse
    {
        $user->load([
            'employeeProfile',
            'educations',
            'department',
            'position',
            'manager',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'profile' => $user->employeeProfile,
                'educations' => $user->educations,
            ],
        ]);
    }

    /**
     * Update logged-in employee profile.
     */
    public function update(
        UpdateEmployeeProfileRequest $request
    ): JsonResponse {

        /** @var User $user */
        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Create or Update Profile
        |--------------------------------------------------------------------------
        */

        $profile = EmployeeProfile::updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            $request->validated()
        );

        /*
        |--------------------------------------------------------------------------
        | Reload User With Relations
        |--------------------------------------------------------------------------
        */

        $user->load([
            'employeeProfile',
            'educations',
            'department',
            'position',
            'manager',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => [
                'user' => $user,
                'profile' => $profile,
                'educations' => $user->educations,
            ],
        ]);
    }
}