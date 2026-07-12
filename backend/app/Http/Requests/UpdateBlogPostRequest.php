<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBlogPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $postId = $this->route('id');

        return [
            'title' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('blog_posts', 'slug')->ignore($postId),
            ],
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'image_path' => 'nullable|string',
            'status' => ['required', 'string', Rule::in(['draft', 'published'])],
            'published_at' => 'nullable|date',
        ];
    }
}
