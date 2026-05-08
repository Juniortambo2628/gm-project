<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Setting;
use App\Models\Service;
use App\Models\Faq;
use App\Models\Testimonial;
use App\Models\BlogPost;

class ContentController extends Controller
{
    /**
     * Fetch all site content for the frontend
     */
    public function index()
    {
        return response()->json([
            'settings' => Setting::all()->pluck('value', 'key'),
            'services' => Service::where('is_active', true)->get(),
            'faqs' => Faq::orderBy('order')->get(),
            'testimonials' => Testimonial::all(),
            'blog_posts' => BlogPost::where('status', 'published')->orderBy('published_at', 'desc')->take(5)->get(),
        ]);
    }

    /**
     * Fetch services specifically
     */
    public function services()
    {
        return response()->json(Service::where('is_active', true)->get());
    }

    /**
     * Fetch FAQs specifically
     */
    public function faqs()
    {
        return response()->json(Faq::orderBy('order')->get());
    }
}
