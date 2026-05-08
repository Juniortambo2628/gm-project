<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = [
        'name', 
        'type', 
        'duration', 
        'price', 
        'currency', 
        'features', 
        'is_active', 
        'description'
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean',
    ];
}
