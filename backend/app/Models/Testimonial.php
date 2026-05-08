<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'client_name', 
        'client_role', 
        'content', 
        'portrait_path', 
        'is_featured',
        'tag'
    ];

    protected $casts = [
        'is_featured' => 'boolean',
    ];
}
