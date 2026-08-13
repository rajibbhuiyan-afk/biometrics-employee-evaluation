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
        'overall_rating',
        'employee_comment',
        'submitted_at',
        'reviewed_at',
        'approved_at',
    ];

    protected $casts = [
        'overall_rating' => 'decimal:2',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
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