<?php

namespace Tests\Feature;

use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TestimonialCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_create_testimonial(): void
    {
        $payload = [
            'client_name' => 'Jane Doe',
            'client_role' => 'MBA Candidate',
            'content' => 'Amazing coaching service!',
            'tag' => 'mba',
        ];

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/testimonials', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('testimonials', ['client_name' => 'Jane Doe']);
    }

    public function test_admin_can_update_testimonial(): void
    {
        $testimonial = Testimonial::factory()->create(['client_name' => 'Old Name']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->putJson("/api/cms/testimonials/{$testimonial->id}", [
                'client_name' => 'New Name',
                'content' => $testimonial->content,
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('testimonials', ['id' => $testimonial->id, 'client_name' => 'New Name']);
    }

    public function test_admin_can_delete_testimonial(): void
    {
        $testimonial = Testimonial::factory()->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->deleteJson("/api/cms/testimonials/{$testimonial->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('testimonials', ['id' => $testimonial->id]);
    }

    public function test_participant_cannot_create_testimonial(): void
    {
        $user = $this->createParticipant();

        $response = $this->withHeaders($this->jsonHeaders($user))
            ->postJson('/api/cms/testimonials', [
                'client_name' => 'Hacker',
                'content' => 'Fake testimonial',
            ]);

        $response->assertForbidden();
    }

    public function test_testimonial_validation_requires_name_and_content(): void
    {
        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/testimonials', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['client_name', 'content']);
    }
}
