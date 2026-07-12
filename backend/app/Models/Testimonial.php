<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Testimonial extends Model
{
    use HasFactory;
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
