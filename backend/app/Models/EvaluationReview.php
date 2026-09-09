<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluation_id',
        'question_id',
        'reviewer_id',
        'reviewer_role',
        'review_result',
        'rating',
        'comment',
        'action',
        'reviewed_at',
    ];

    protected $casts = [
        'rating' => 'float',
        'reviewed_at' => 'datetime',
    ];


    /**
     * Evaluation
     */
    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(
            Evaluation::class
        );
    }


    /**
     * Question
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(
            EvaluationQuestion::class,
            'question_id'
        );
    }


    /**
     * Reviewer User
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'reviewer_id'
        );
    }
}