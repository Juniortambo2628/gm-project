<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_list_users(): void
    {
        User::factory()->count(3)->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/users');

        $response->assertOk();
        $response->assertJsonStructure(['data']);
    }

    public function test_admin_can_create_user(): void
    {
        $payload = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'participant',
        ];

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/users', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }

    public function test_admin_can_update_user(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->putJson("/api/cms/users/{$user->id}", [
                'name' => 'Updated Name',
                'email' => $user->email,
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_update_user_role(): void
    {
        $user = User::factory()->create(['role' => 'participant']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->putJson("/api/cms/users/{$user->id}/role", ['role' => 'admin']);

        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'admin']);
    }

    public function test_admin_cannot_demote_themselves(): void
    {
        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->putJson("/api/cms/users/{$this->admin->id}/role", ['role' => 'participant']);

        $response->assertForbidden();
    }

    public function test_admin_can_delete_user(): void
    {
        $user = User::factory()->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->deleteJson("/api/cms/users/{$user->id}");

        $response->assertOk();
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_themselves(): void
    {
        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->deleteJson("/api/cms/users/{$this->admin->id}");

        $response->assertForbidden();
    }

    public function test_participant_cannot_list_users(): void
    {
        $user = $this->createParticipant();

        $response = $this->withHeaders($this->jsonHeaders($user))
            ->getJson('/api/cms/users');

        $response->assertForbidden();
    }
}
