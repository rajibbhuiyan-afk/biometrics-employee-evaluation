<?php

namespace App\Http\Controllers;

use App\Models\Role;
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
            'manager',
        ])
        ->latest()
        ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Get managers for user assignment.
     */
    public function managers(): JsonResponse
    {
        $managers = User::with('role')
            ->where('status', true)
            ->orderBy('name')
            ->get([
                'id',
                'employee_id',
                'name',
                'email',
                'role_id',
            ]);

        return response()->json([
            'success' => true,
            'data' => $managers,
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

            'manager_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'status' => [
                'nullable',
                'boolean',
            ],

            'joining_date' => [
                'nullable',
                'date',
            ],
        ]);

        $lastEmployee = User::orderByDesc('id')->first();

        $nextNumber = $lastEmployee
            ? $lastEmployee->id + 1
            : 1;

        $employeeId = 'EMP-' . str_pad(
            $nextNumber,
            4,
            '0',
            STR_PAD_LEFT
        );

        $validated['employee_id'] = $employeeId;

        /*
        |--------------------------------------------------------------------------
        | Validate Manager
        |--------------------------------------------------------------------------
        */

        // if (!empty($validated['manager_id'])) {

        //     $manager = User::with('role')->find(
        //         $validated['manager_id']
        //     );

        //     if (
        //         !$manager ||
        //         !$manager->role ||
        //         $manager->role->name !== 'Manager'
        //     ) {

        //         return response()->json([
        //             'success' => false,
        //             'message' => 'Selected user is not a Manager.',
        //         ], 422);
        //     }
        // }

        /*
        |--------------------------------------------------------------------------
        | Password
        |--------------------------------------------------------------------------
        */

        $validated['password'] = Hash::make(
            $validated['password']
        );

        /*
        |--------------------------------------------------------------------------
        | Default Status
        |--------------------------------------------------------------------------
        */

        if (!isset($validated['status'])) {
            $validated['status'] = true;
        }

        /*
        |--------------------------------------------------------------------------
        | Create User
        |--------------------------------------------------------------------------
        */

        $user = User::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => $user->load([
                'role',
                'department',
                'position',
                'manager',
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
            'manager',
            'managedEmployees',
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

            /*
            |--------------------------------------------------------------------------
            | Reporting Person
            |--------------------------------------------------------------------------
            |
            | Any user can be selected as reporting person.
            | The user cannot report to himself/herself.
            |
            */

            'manager_id' => [
                'nullable',
                'integer',
                'exists:users,id',
                Rule::notIn([$user->id]),
            ],

            'status' => [
                'nullable',
                'boolean',
            ],

            'joining_date' => [
                'nullable',
                'date',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Update User
        |--------------------------------------------------------------------------
        */

        $user->update($validated);


        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => $user->fresh()->load([
                'role',
                'department',
                'position',
                'manager',
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
                'message' =>
                    'Cannot delete this user because evaluation records exist.',
            ], 409);
        }

        if ($user->reviews()->exists()) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Cannot delete this user because review records exist.',
            ], 409);
        }

        /*
        |--------------------------------------------------------------------------
        | Check managed employees
        |--------------------------------------------------------------------------
        */

        if ($user->managedEmployees()->exists()) {

            return response()->json([
                'success' => false,
                'message' =>
                    'Cannot delete this manager because employees are assigned to this manager.',
            ], 409);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

        /*
        |--------------------------------------------------------------------------
        | Change Password
        |--------------------------------------------------------------------------
        */

        public function changePassword(
            Request $request,
            User $user
        ): JsonResponse {

            $validated = $request->validate([
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                ],
            ]);

            $user->update([
                'password' => Hash::make(
                    $validated['password']
                ),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User password changed successfully.',
            ]);
        }

}
