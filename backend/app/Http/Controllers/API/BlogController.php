<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreBlogPostRequest;
use App\Http\Requests\UpdateBlogPostRequest;
use App\Http\Resources\BlogPostResource;
use App\Models\BlogPost;

class BlogController extends BaseCrudController
{
    protected string $modelClass = BlogPost::class;
    protected string $resourceClass = BlogPostResource::class;
    protected ?string $storeRequestClass = StoreBlogPostRequest::class;
    protected ?string $updateRequestClass = UpdateBlogPostRequest::class;
    protected ?int $perPage = 15;
}
