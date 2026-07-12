<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IntegrationTestResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'status',
        'configured',
        'connected',
        'message',
        'details',
        'tested_at',
    ];

    protected function casts(): array
    {
        return [
            'configured' => 'boolean',
            'connected' => 'boolean',
            'details' => 'array',
            'tested_at' => 'datetime',
        ];
    }
}
