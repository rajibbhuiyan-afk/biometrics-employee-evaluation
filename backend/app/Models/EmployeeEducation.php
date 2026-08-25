<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeEducation extends Model
{
    use HasFactory;

    protected $table = 'employee_educations';

    protected $fillable = [
        'user_id',
        'degree',
        'institution_name',
        'subject',
        'board_university',
        'passing_year',
        'result',
        'certificate_number',
        'achievement',
    ];

    protected $casts = [
        'passing_year' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }
}