<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',

        'father_name',
        'mother_name',
        'date_of_birth',
        'gender',
        'blood_group',
        'nationality',
        'religion',
        'marital_status',

        'nid',
        'passport_number',
        'driving_license_number',

        'personal_email',
        'mobile_number',

        'emergency_contact_number',
        'emergency_contact_person',
        'emergency_contact_relationship',

        'present_address',
        'permanent_address',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    /**
     * Employee profile belongs to one user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }
}