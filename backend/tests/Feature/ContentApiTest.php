<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\Faq;
use App\Models\Service;
use App\Models\Setting;
use App\Models\Testimonial;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_site_content_returns_all_public_data(): void
    {
        Service::factory()->create(['is_active' => true]);
        Faq::factory()->create();
        Testimonial::factory()->create();
        BlogPost::factory()->create(['status' => 'published']);
        Setting::set('site_name', 'Test Site', 'general');

        $response = $this->getJson('/api/site-content');

        $response->assertOk();
        $response->assertJsonStructure([
            'settings',
            'services',
            'faqs',
            'testimonials',
            'blog_posts',
        ]);
    }

    public function test_services_endpoint_returns_active_services_only(): void
    {
        Service::factory()->create(['is_active' => true]);
        Service::factory()->create(['is_active' => false]);

        $response = $this->getJson('/api/services');

        $response->assertOk();
        $response->assertJsonCount(1);
    }

    public function test_service_endpoint_returns_single_service(): void
    {
        $service = Service::factory()->create(['is_active' => true]);

        $response = $this->getJson("/api/services/{$service->id}");

        $response->assertOk();
        $response->assertJsonFragment(['name' => $service->name]);
    }

    public function test_service_endpoint_returns_404_for_inactive_service(): void
    {
        $service = Service::factory()->create(['is_active' => false]);

        $response = $this->getJson("/api/services/{$service->id}");

        $response->assertNotFound();
    }

    public function test_faqs_endpoint_returns_ordered_faqs(): void
    {
        Faq::factory()->create(['order' => 2]);
        Faq::factory()->create(['order' => 1]);

        $response = $this->getJson('/api/faqs');

        $response->assertOk();
        $response->assertJsonCount(2);
    }

    public function test_blog_endpoint_returns_paginated_published_posts(): void
    {
        BlogPost::factory()->create(['status' => 'published']);
        BlogPost::factory()->create(['status' => 'draft']);

        $response = $this->getJson('/api/blog');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_blog_show_returns_post_by_slug(): void
    {
        $post = BlogPost::factory()->create([
            'status' => 'published',
            'slug' => 'test-post',
        ]);

        $response = $this->getJson('/api/blog/test-post');

        $response->assertOk();
        $response->assertJsonFragment(['slug' => 'test-post']);
    }

    public function test_blog_show_returns_404_for_draft(): void
    {
        BlogPost::factory()->create([
            'status' => 'draft',
            'slug' => 'draft-post',
        ]);

        $response = $this->getJson('/api/blog/draft-post');

        $response->assertNotFound();
    }
}
