<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'question',
        'question_type',
        'max_rating',
        'max_answer_words',
        'weight',
        'is_required',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'max_rating' => 'integer',
        'max_answer_words' => 'integer',
        'weight' => 'decimal:2',
        'is_required' => 'boolean',
        'status' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(
            EvaluationCategory::class,
            'category_id'
        );
    }

    public function answers(): HasMany
    {
        return $this->hasMany(
            EvaluationAnswer::class,
            'question_id'
        );
    }
}