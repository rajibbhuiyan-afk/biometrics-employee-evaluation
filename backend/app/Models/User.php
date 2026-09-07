<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'employee_id',
        'name',
        'email',
        'password',
        'gender',
        'employee_type',
        'role_id',
        'department_id',
        'position_id',
        'manager_id',
        'joining_date',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'status' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Role
    |--------------------------------------------------------------------------
    */

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Department
    |--------------------------------------------------------------------------
    */

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Position
    |--------------------------------------------------------------------------
    */

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Reporting To / Manager
    |--------------------------------------------------------------------------
    |
    | manager_id stores the user this employee reports to.
    |
    | The Reporting To user can have any role:
    |
    | Employee
    | Manager
    | HR
    | Management
    |
    | Example:
    |
    | Employee A
    |     manager_id = Employee B
    |
    | In that case Employee B is the first reviewer of
    | Employee A's evaluation.
    |
    */

    public function manager(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'manager_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Reporting To
    |--------------------------------------------------------------------------
    |
    | Same relationship as manager().
    |
    | This name is used by the dynamic evaluation workflow because
    | manager_id does not necessarily point to a user with Manager role.
    |
    */

    public function reportingTo(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'manager_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Employees / Direct Reports
    |--------------------------------------------------------------------------
    |
    | Returns users whose manager_id points to this user.
    |
    */

    public function employees(): HasMany
    {
        return $this->hasMany(
            User::class,
            'manager_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Managed Employees
    |--------------------------------------------------------------------------
    |
    | Kept for backward compatibility with existing application code.
    |
    */

    public function managedEmployees(): HasMany
    {
        return $this->hasMany(
            User::class,
            'manager_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Evaluations
    |--------------------------------------------------------------------------
    |
    | Evaluations created by this user.
    |
    */

    public function evaluations(): HasMany
    {
        return $this->hasMany(
            Evaluation::class,
            'employee_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Evaluation Reviews
    |--------------------------------------------------------------------------
    |
    | Reviews created by this user.
    |
    */

    public function reviews(): HasMany
    {
        return $this->hasMany(
            EvaluationReview::class,
            'reviewer_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Probation Periods
    |--------------------------------------------------------------------------
    */

    public function probationPeriods(): HasMany
    {
        return $this->hasMany(
            ProbationPeriod::class,
            'employee_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Employee Profile
    |--------------------------------------------------------------------------
    */

    public function employeeProfile()
    {
        return $this->hasOne(
            EmployeeProfile::class,
            'user_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Educations
    |--------------------------------------------------------------------------
    */

    public function educations()
    {
        return $this->hasMany(
            EmployeeEducation::class,
            'user_id'
        );
    }
}