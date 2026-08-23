<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProbationPeriodRequest;
use App\Models\ProbationPeriod;
use Illuminate\Http\JsonResponse;

class ProbationPeriodController extends Controller
{
    /**
     * Display all probation periods.
     */
    public function index(): JsonResponse
    {
        $periods = ProbationPeriod::with([
            'employee',
        ])
        ->latest()
        ->get();

        return response()->json([
            'success' => true,
            'data' => $periods,
        ]);
    }

    /**
     * Store a new probation period.
     */
    public function store(
        StoreProbationPeriodRequest $request
    ): JsonResponse {

        $period = ProbationPeriod::create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Probation period created successfully.',
            'data' => $period->load([
                'employee',
            ]),
        ], 201);
    }

    /**
     * Display a probation period.
     */
    public function show(
        ProbationPeriod $probationPeriod
    ): JsonResponse {

        $probationPeriod->load([
            'employee',
        ]);

        return response()->json([
            'success' => true,
            'data' => $probationPeriod,
        ]);
    }

    /**
     * Update a probation period.
     */
    public function update(
        StoreProbationPeriodRequest $request,
        ProbationPeriod $probationPeriod
    ): JsonResponse {

        $probationPeriod->update(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Probation period updated successfully.',
            'data' => $probationPeriod->load([
                'employee',
            ]),
        ]);
    }

    /**
     * Delete a probation period.
     */
    public function destroy(
        ProbationPeriod $probationPeriod
    ): JsonResponse {

        $probationPeriod->delete();

        return response()->json([
            'success' => true,
            'message' => 'Probation period deleted successfully.',
        ]);
    }

    /**
     * Display active probation periods.
     */
    public function active(): JsonResponse
    {
        $periods = ProbationPeriod::with([
            'employee',
        ])
        ->where('status', 'active')
        ->whereDate('start_date', '<=', now())
        ->whereDate('end_date', '>=', now())
        ->latest()
        ->get();

        return response()->json([
            'success' => true,
            'data' => $periods,
        ]);
    }
}