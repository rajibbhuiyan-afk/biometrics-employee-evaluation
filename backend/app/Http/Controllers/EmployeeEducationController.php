<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeEducationRequest;
use App\Models\EmployeeEducation;
use Illuminate\Http\JsonResponse;

class EmployeeEducationController extends Controller
{
    /**
     * Display logged-in employee's education records.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $educations = EmployeeEducation::where(
            'user_id',
            $user->id
        )
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $educations,
        ]);
    }


    /**
     * Store new education record.
     */
    public function store(
        StoreEmployeeEducationRequest $request
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Create Education
        |--------------------------------------------------------------------------
        |
        | Do NOT use:
        |
        | ...$request->validated()
        |
        | because PHP 8.0 does not support unpacking
        | associative arrays in this way.
        |
        */

        $educationData = $request->validated();

        $educationData['user_id'] = $user->id;

        $education = EmployeeEducation::create(
            $educationData
        );

        return response()->json([
            'success' => true,
            'message' => 'Education record added successfully.',
            'data' => $education,
        ], 201);
    }


    /**
     * Update education record.
     */
    public function update(
        StoreEmployeeEducationRequest $request,
        EmployeeEducation $education
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Ownership Check
        |--------------------------------------------------------------------------
        */

        if (
            (int) $education->user_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only update your own education records.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Update Education
        |--------------------------------------------------------------------------
        */

        $education->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Education record updated successfully.',
            'data' => $education->fresh(),
        ]);
    }


    /**
     * Delete education record.
     */
    public function destroy(
        EmployeeEducation $education
    ): JsonResponse {

        $user = auth()->user();

        /*
        |--------------------------------------------------------------------------
        | Ownership Check
        |--------------------------------------------------------------------------
        */

        if (
            (int) $education->user_id !==
            (int) $user->id
        ) {

            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own education records.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | Delete Education
        |--------------------------------------------------------------------------
        */

        $education->delete();

        return response()->json([
            'success' => true,
            'message' => 'Education record deleted successfully.',
        ]);
    }
}