<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'rating' => 'decimal:2',
        'reviewed_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Evaluation
    |--------------------------------------------------------------------------
    */

    public function evaluation()
    {
        return $this->belongsTo(
            Evaluation::class,
            'evaluation_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Question
    |--------------------------------------------------------------------------
    */

    public function question()
    {
        return $this->belongsTo(
            EvaluationQuestion::class,
            'question_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Reviewer
    |--------------------------------------------------------------------------
    */

    public function reviewer()
    {
        return $this->belongsTo(
            User::class,
            'reviewer_id'
        );
    }
}