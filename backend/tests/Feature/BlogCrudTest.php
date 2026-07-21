<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_list_blog_posts(): void
    {
        BlogPost::factory()->count(3)->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/blog');

        $response->assertOk();
        $response->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_blog_post(): void
    {
        $payload = [
            'title' => 'New Blog Post',
            'slug' => 'new-blog-post',
            'content' => 'This is the content of the blog post.',
            'excerpt' => 'A short excerpt.',
            'status' => 'draft',
        ];

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/blog', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('blog_posts', ['title' => 'New Blog Post']);
    }

    public function test_admin_can_update_blog_post(): void
    {
        $post = BlogPost::factory()->create(['title' => 'Old Title']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->putJson("/api/cms/blog/{$post->id}", [
                'title' => 'Updated Title',
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'status' => $post->status,
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('blog_posts', ['id' => $post->id, 'title' => 'Updated Title']);
    }

    public function test_admin_can_delete_blog_post(): void
    {
        $post = BlogPost::factory()->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->deleteJson("/api/cms/blog/{$post->id}");

        $response->assertOk();
        $this->assertSoftDeleted('blog_posts', ['id' => $post->id]);
    }

    public function test_unauthenticated_user_cannot_create_blog_post(): void
    {
        $response = $this->postJson('/api/cms/blog', [
            'title' => 'Unauthorized Post',
            'content' => 'Content',
        ]);

        $response->assertUnauthorized();
    }
}
