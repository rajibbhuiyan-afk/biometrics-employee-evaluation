<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                'unique:roles,name',
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

        $role = Role::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully.',
            'data' => $role,
        ], 201);
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): JsonResponse
    {
        $role->loadCount('users');

        return response()->json([
            'success' => true,
            'data' => $role,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('roles', 'name')
                    ->ignore($role->id),
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

        $role->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully.',
            'data' => $role,
        ]);
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): JsonResponse
    {
        if ($role->users()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete this role because it is assigned to one or more users.',
            ], 409);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully.',
        ]);
    }
}