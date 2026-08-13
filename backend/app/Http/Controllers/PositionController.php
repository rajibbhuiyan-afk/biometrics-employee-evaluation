<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PositionController extends Controller
{
    /**
     * Display a listing of positions.
     */
    public function index(): JsonResponse
    {
        $positions = Position::with([
            'department',
        ])
        ->withCount('users')
        ->latest()
        ->get();

        return response()->json([
            'success' => true,
            'data' => $positions,
        ]);
    }

    /**
     * Store a newly created position.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => [
                'required',
                'integer',
                'exists:departments,id',
            ],

            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'code' => [
                'required',
                'string',
                'max:50',
                'unique:positions,code',
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

        $position = Position::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Position created successfully.',
            'data' => $position->load('department'),
        ], 201);
    }

    /**
     * Display the specified position.
     */
    public function show(Position $position): JsonResponse
    {
        $position->load([
            'department',
            'users',
        ]);

        return response()->json([
            'success' => true,
            'data' => $position,
        ]);
    }

    /**
     * Update the specified position.
     */
    public function update(
        Request $request,
        Position $position
    ): JsonResponse {
        $validated = $request->validate([
            'department_id' => [
                'required',
                'integer',
                'exists:departments,id',
            ],

            'name' => [
                'required',
                'string',
                'max:100',
            ],

            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('positions', 'code')
                    ->ignore($position->id),
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

        $position->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Position updated successfully.',
            'data' => $position->load('department'),
        ]);
    }

    /**
     * Remove the specified position.
     */
    public function destroy(Position $position): JsonResponse
    {
        if ($position->users()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete this position because it is assigned to one or more users.',
            ], 409);
        }

        $position->delete();

        return response()->json([
            'success' => true,
            'message' => 'Position deleted successfully.',
        ]);
    }
}