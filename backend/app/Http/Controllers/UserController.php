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
             'gender' => [
                'required',
                'in:male,female',
            ],

            'employee_type' => [
                'required',
                'in:regular,support_staff,cpa',
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

        // $lastEmployee = User::orderByDesc('id')->first();

        // $nextNumber = $lastEmployee
        //     ? $lastEmployee->id + 1
        //     : 1;

        // $employeeId = 'EMP-' . str_pad(
        //     $nextNumber,
        //     4,
        //     '0',
        //     STR_PAD_LEFT
        // );

        // $validated['employee_id'] = $employeeId;

                /*
        |--------------------------------------------------------------------------
        | Generate Employee ID
        |--------------------------------------------------------------------------
        */

        $joiningDate = $validated['joining_date'] ?? now()->format('Y-m-d');

        $date = \Carbon\Carbon::parse($joiningDate);

        $year = $date->format('y');   // 2026 -> 26
        $month = $date->format('m');  // May -> 05


        /*
        |--------------------------------------------------------------------------
        | Gender Code
        |--------------------------------------------------------------------------
        |
        | Male   = 1
        | Female = 2
        |
        */

        $genderCode = match ($validated['gender']) {
            'male' => '1',
            'female' => '2',
        };


        /*
        |--------------------------------------------------------------------------
        | Employee Type Prefix
        |--------------------------------------------------------------------------
        |
        | Regular       = no prefix
        | Support Staff = SS
        | CPA           = CPA
        |
        */

        $typePrefix = match ($validated['employee_type']) {
            'regular' => '',
            'support_staff' => 'SS',
            'cpa' => 'CPA',
        };


        /*
        |--------------------------------------------------------------------------
        | Employee ID Prefix
        |--------------------------------------------------------------------------
        */

        $employeeIdPrefix =
            $typePrefix .
            $year .
            $month .
            $genderCode;


        /*
        |--------------------------------------------------------------------------
        | Find Last Serial
        |--------------------------------------------------------------------------
        */

        $lastEmployee = User::where(
                'employee_id',
                'like',
                $employeeIdPrefix . '%'
            )
            ->orderByDesc('employee_id')
            ->first();


        /*
        |--------------------------------------------------------------------------
        | Generate Next Serial
        |--------------------------------------------------------------------------
        */

        if ($lastEmployee) {

            $lastSerial = (int) substr(
                $lastEmployee->employee_id,
                strlen($employeeIdPrefix)
            );

            $nextSerial = $lastSerial + 1;

        } else {

            $nextSerial = 1;
        }


        /*
        |--------------------------------------------------------------------------
        | Final Employee ID
        |--------------------------------------------------------------------------
        |
        | Serial = 3 digits
        |
        */

        $employeeId = $employeeIdPrefix . str_pad(
            $nextSerial,
            3,
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
            'employee_id' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'employee_id')
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

      public function changePassword(Request $request): JsonResponse
{
    $validated = $request->validate([
        'password' => [
            'required',
            'string',
            'min:8',
            'confirmed',
        ],
    ]);

    $user = $request->user();

    $user->update([
        'password' => Hash::make(
            $validated['password']
        ),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Password changed successfully.',
    ]);
}

}
