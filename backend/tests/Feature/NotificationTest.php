<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_list_notifications(): void
    {
        Notification::factory()->create(['user_id' => $this->admin->id]);
        Notification::factory()->create(['user_id' => $this->admin->id, 'is_read' => true]);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/notifications');

        $response->assertOk();
    }

    public function test_admin_can_mark_notification_as_read(): void
    {
        $notification = Notification::factory()->create([
            'user_id' => $this->admin->id,
            'is_read' => false,
        ]);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson("/api/cms/notifications/{$notification->id}/read");

        $response->assertOk();
        $this->assertDatabaseHas('notifications', ['id' => $notification->id, 'is_read' => true]);
    }

    public function test_admin_can_mark_all_notifications_as_read(): void
    {
        Notification::factory()->count(3)->create([
            'user_id' => $this->admin->id,
            'is_read' => false,
        ]);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/notifications/read-all');

        $response->assertOk();
        $this->assertDatabaseCount('notifications', 3);
        $this->assertDatabaseHas('notifications', ['user_id' => $this->admin->id, 'is_read' => true]);
    }

    public function test_user_cannot_access_other_users_notifications(): void
    {
        $otherAdmin = $this->createAdmin(['email' => 'other@example.com']);
        Notification::factory()->create(['user_id' => $otherAdmin->id]);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/notifications');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }
}
