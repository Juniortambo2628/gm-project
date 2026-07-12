<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogPostResource;
use App\Http\Resources\FaqResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\TestimonialResource;
use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class ContentController extends Controller
{
    /**
     * Public-safe setting groups.
     */
    protected array $publicGroups = ['general', 'about', 'branding', 'communications', 'hero', 'media'];

    /**
     * Fetch all site content for the frontend
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'settings' => $this->publicSettings(),
            'services' => ServiceResource::collection(Service::query()->where('is_active', true)->get()),
            'faqs' => FaqResource::collection(Faq::query()->orderBy('order')->get()),
            'testimonials' => TestimonialResource::collection(Testimonial::query()->get()),
            'blog_posts' => BlogPostResource::collection(
                BlogPost::query()
                    ->where('status', 'published')
                    ->orderBy('published_at', 'desc')
                    ->take(5)
                    ->get()
            ),
        ]);
    }

    /**
     * Fetch services specifically
     */
    public function services(): JsonResponse
    {
        return response()->json(
            ServiceResource::collection(Service::query()->where('is_active', true)->get())
        );
    }

    /**
     * Fetch a single public service.
     */
    public function service($id): JsonResponse
    {
        $service = Service::query()->where('is_active', true)->findOrFail($id);

        return response()->json(new ServiceResource($service));
    }

    /**
     * Fetch FAQs specifically
     */
    public function faqs(): JsonResponse
    {
        return response()->json(
            FaqResource::collection(Faq::query()->orderBy('order')->get())
        );
    }

    /**
     * List published blog posts.
     */
    public function blog(): JsonResponse
    {
        $posts = BlogPost::query()
            ->where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->paginate(12);

        return BlogPostResource::collection($posts)->response();
    }

    /**
     * Show a published blog post by slug.
     */
    public function blogShow($slug): JsonResponse
    {
        $post = BlogPost::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        return response()->json(new BlogPostResource($post));
    }

    /**
     * Get public-safe settings as a flat key => value map.
     */
    protected function publicSettings(): array
    {
        return Setting::query()
            ->whereIn('group', $this->publicGroups)
            ->get()
            ->pluck('value', 'key')
            ->toArray();
    }
}
