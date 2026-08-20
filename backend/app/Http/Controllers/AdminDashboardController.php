<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $data = [
            'employees' => User::whereHas('role', function ($query) {
                $query->where('name', 'Employee');
            })->count(),

            'managers' => User::whereHas('role', function ($query) {
                $query->where('name', 'Manager');
            })->count(),

            'hr' => User::whereHas('role', function ($query) {
                $query->where('name', 'HR');
            })->count(),

            'total_evaluations' => Evaluation::count(),

            'draft' => Evaluation::where('status', 'draft')->count(),

            'submitted' => Evaluation::where('status', 'submitted')->count(),

            'reviewed' => Evaluation::where('status', 'reviewed')->count(),

            'approved' => Evaluation::where('status', 'approved')->count(),

            'rejected' => Evaluation::where('status', 'rejected')->count(),

            'returned' => Evaluation::where('status', 'returned')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}