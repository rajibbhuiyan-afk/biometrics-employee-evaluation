<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'submission_start_date',
        'submission_end_date',
        'status',
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'submission_start_date' => 'date',
        'submission_end_date' => 'date',
    ];

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }
}