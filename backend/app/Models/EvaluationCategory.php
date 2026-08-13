<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EvaluationCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(EvaluationQuestion::class, 'category_id');
    }
}