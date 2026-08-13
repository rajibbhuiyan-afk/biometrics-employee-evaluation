<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'module',
        'record_id',
        'description',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'record_id' => 'integer',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }
}