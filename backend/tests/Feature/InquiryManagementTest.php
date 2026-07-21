<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class InquiryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_list_inquiries(): void
    {
        Message::factory()->count(3)->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/inquiries');

        $response->assertOk();
    }

    public function test_admin_can_show_inquiry(): void
    {
        $message = Message::factory()->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson("/api/cms/inquiries/{$message->id}");

        $response->assertOk();
        $response->assertJsonFragment(['id' => $message->id]);
    }

    public function test_admin_can_mark_inquiry_as_read(): void
    {
        $message = Message::factory()->create(['is_read' => false]);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson("/api/cms/inquiries/{$message->id}/read");

        $response->assertOk();
        $this->assertDatabaseHas('messages', ['id' => $message->id, 'is_read' => true]);
    }

    public function test_admin_can_delete_inquiry(): void
    {
        $message = Message::factory()->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->deleteJson("/api/cms/inquiries/{$message->id}");

        $response->assertOk();
        $this->assertSoftDeleted('messages', ['id' => $message->id]);
    }

    public function test_participant_cannot_list_inquiries(): void
    {
        $user = $this->createParticipant();

        $response = $this->withHeaders($this->jsonHeaders($user))
            ->getJson('/api/cms/inquiries');

        $response->assertForbidden();
    }
}
