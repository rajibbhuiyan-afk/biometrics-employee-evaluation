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
    | Manager
    |--------------------------------------------------------------------------
    |
    | This user belongs to one manager.
    */

    public function manager(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'manager_id'
        );
    }

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
    | A manager has many employees.
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
    public function employeeProfile()
    {
        return $this->hasOne(
            EmployeeProfile::class,
            'user_id'
        );
    }

    public function educations()
    {
        return $this->hasMany(
            EmployeeEducation::class,
            'user_id'
        );
    }
}
