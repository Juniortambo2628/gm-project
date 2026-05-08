<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BlogPost;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    /**
     * List all blog posts.
     */
    public function index()
    {
        $posts = BlogPost::latest()->get();
        return response()->json($posts);
    }

    /**
     * Store a new blog post.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'image_path' => 'nullable|string',
            'status' => 'required|string|in:draft,published',
            'published_at' => 'nullable|date',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . rand(1000, 9999);
        }

        $post = BlogPost::create($validated);

        return response()->json([
            'message' => 'Blog post created successfully',
            'post' => $post
        ], 201);
    }

    /**
     * Update an existing blog post.
     */
    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'image_path' => 'nullable|string',
            'status' => 'required|string|in:draft,published',
            'published_at' => 'nullable|date',
        ]);

        $post->update($validated);

        return response()->json([
            'message' => 'Blog post updated successfully',
            'post' => $post
        ]);
    }

    /**
     * Delete a blog post.
     */
    public function destroy($id)
    {
        BlogPost::destroy($id);
        return response()->json(['message' => 'Blog post deleted successfully']);
    }
}
