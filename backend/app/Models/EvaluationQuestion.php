<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationQuestion extends Model
{
    protected $fillable = [
        'category_id',
        'department_id',
        'position_id',
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
            EvaluationCategory::class
        );
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(
            Department::class
        );
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(
            Position::class
        );
    }

    public function answers(): HasMany
    {
        return $this->hasMany(
            EvaluationAnswer::class
        );
    }

    public function reviewers(): BelongsToMany
    {
        return $this->belongsToMany(
            Role::class,
            'evaluation_question_reviewers',
            'evaluation_question_id',
            'role_id'
        )->withTimestamps();
    }
}