<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'title', 
        'slug', 
        'excerpt', 
        'content', 
        'image_path', 
        'published_at', 
        'status'
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}
