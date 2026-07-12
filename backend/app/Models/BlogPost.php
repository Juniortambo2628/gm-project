<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BlogPost extends Model
{
    use HasFactory, SoftDeletes;

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
