<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index(): JsonResponse
    {
        $departments = Department::withCount('users')
            ->withCount('positions')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $departments,
        ]);
    }

    /**
     * Store a newly created department.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'code' => [
                'required',
                'string',
                'max:50',
                'unique:departments,code',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'status' => [
                'nullable',
                'boolean',
            ],
        ]);

        $department = Department::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Department created successfully.',
            'data' => $department,
        ], 201);
    }

    /**
     * Display the specified department.
     */
    public function show(Department $department): JsonResponse
    {
        $department->load([
            'positions',
            'users',
        ]);

        return response()->json([
            'success' => true,
            'data' => $department,
        ]);
    }

    /**
     * Update the specified department.
     */
    public function update(
        Request $request,
        Department $department
    ): JsonResponse {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('departments', 'code')
                    ->ignore($department->id),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'status' => [
                'nullable',
                'boolean',
            ],
        ]);

        $department->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully.',
            'data' => $department,
        ]);
    }

    /**
     * Remove the specified department.
     */
    public function destroy(Department $department): JsonResponse
    {
        if ($department->users()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete this department because it has assigned users.',
            ], 409);
        }

        if ($department->positions()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete this department because it has assigned positions.',
            ], 409);
        }

        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Department deleted successfully.',
        ]);
    }
}