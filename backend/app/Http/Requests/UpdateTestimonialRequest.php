<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'client_name' => 'required|string|max:255',
            'client_role' => 'nullable|string|max:255',
            'content' => 'required|string',
            'portrait_path' => 'nullable|string',
            'is_featured' => 'boolean',
            'tag' => 'nullable|string|max:255',
        ];
    }
}
