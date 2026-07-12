<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blog_posts,slug',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'image_path' => 'nullable|string',
            'status' => ['required', 'string', Rule::in(['draft', 'published'])],
            'published_at' => 'nullable|date',
        ];
    }
}
