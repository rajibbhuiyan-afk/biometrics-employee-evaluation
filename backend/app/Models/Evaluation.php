<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'evaluation_period_id',
        'status',
        'employee_comment',

        'manager_overall_rating',
        'manager_reviewed_at',
        'manager_approved_at',

        'hr_overall_rating',
        'hr_reviewed_at',
        'hr_approved_at',

        'management_overall_rating',
        'management_reviewed_at',
        'management_approved_at',

        'approved_at',
        'submitted_at',
    ];

    protected $casts = [
        'manager_overall_rating' => 'decimal:2',
        'hr_overall_rating' => 'decimal:2',
        'management_overall_rating' => 'decimal:2',

        'manager_reviewed_at' => 'datetime',
        'manager_approved_at' => 'datetime',

        'hr_reviewed_at' => 'datetime',
        'hr_approved_at' => 'datetime',

        'management_reviewed_at' => 'datetime',
        'management_approved_at' => 'datetime',

        'approved_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(
            User::class,
            'employee_id'
        );
    }

    public function evaluationPeriod()
    {
        return $this->belongsTo(
            EvaluationPeriod::class,
            'evaluation_period_id'
        );
    }

    public function answers()
    {
        return $this->hasMany(
            EvaluationAnswer::class,
            'evaluation_id'
        );
    }

    public function reviews()
    {
        return $this->hasMany(
            EvaluationReview::class,
            'evaluation_id'
        );
    }
}