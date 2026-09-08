<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evaluation extends Model
{
    protected $fillable = [
        'employee_id',
        'evaluation_period_id',
        'status',

        'overall_rating',

        'employee_overall_rating',
        'employee_reviewed_at',
        'employee_approved_at',

        'manager_overall_rating',
        'manager_reviewed_at',
        'manager_approved_at',

        'hr_overall_rating',
        'hr_reviewed_at',
        'hr_approved_at',

        'management_overall_rating',
        'management_reviewed_at',
        'management_approved_at',

        'employee_comment',

        'submitted_at',
        'approved_at',
    ];

    protected $casts = [
        'overall_rating' => 'decimal:2',

        'employee_overall_rating' => 'decimal:2',
        'manager_overall_rating' => 'decimal:2',
        'hr_overall_rating' => 'decimal:2',
        'management_overall_rating' => 'decimal:2',

        'employee_reviewed_at' => 'datetime',
        'employee_approved_at' => 'datetime',

        'manager_reviewed_at' => 'datetime',
        'manager_approved_at' => 'datetime',

        'hr_reviewed_at' => 'datetime',
        'hr_approved_at' => 'datetime',

        'management_reviewed_at' => 'datetime',
        'management_approved_at' => 'datetime',

        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'employee_id'
        );
    }

    public function evaluationPeriod(): BelongsTo
    {
        return $this->belongsTo(
            EvaluationPeriod::class
        );
    }

    public function answers(): HasMany
    {
        return $this->hasMany(
            EvaluationAnswer::class
        );
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(
            EvaluationReview::class
        );
    }

    public function workflowSteps(): HasMany
    {
        return $this->hasMany(
            EvaluationWorkflowStep::class
        )->orderBy('step_order');
    }

    public function currentWorkflowStep()
    {
        return $this->hasOne(
            EvaluationWorkflowStep::class
        )->where(
            'status',
            'current'
        );
    }
}