<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'evaluation_id',
        'question_id',
        'rating',
        'answer',
        'comment',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function evaluation()
    {
        return $this->belongsTo(
            Evaluation::class,
            'evaluation_id'
        );
    }

    public function question()
    {
        return $this->belongsTo(
            EvaluationQuestion::class,
            'question_id'
        );
    }
}