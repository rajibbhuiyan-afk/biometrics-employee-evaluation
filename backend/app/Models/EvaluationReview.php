<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluation_id',
        'reviewer_id',
        'rating',
        'comment',
        'action',
        'reviewed_at',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'reviewed_at' => 'datetime',
    ];

    public function evaluation()
    {
        return $this->belongsTo(
            Evaluation::class,
            'evaluation_id'
        );
    }

    public function reviewer()
    {
        return $this->belongsTo(
            User::class,
            'reviewer_id'
        );
    }
}