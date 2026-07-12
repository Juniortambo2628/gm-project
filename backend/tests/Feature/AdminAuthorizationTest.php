<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private array $adminRoutes = [
        ['GET', '/api/cms/orders'],
        ['GET', '/api/cms/dashboard'],
        ['GET', '/api/cms/notifications'],
        ['GET', '/api/cms/mail-templates'],
        ['GET', '/api/cms/integrations'],
        ['GET', '/api/cms/blog'],
        ['GET', '/api/cms/inquiries'],
        ['GET', '/api/cms/users'],
    ];

    public function test_unauthenticated_user_cannot_access_admin_routes(): void
    {
        foreach ($this->adminRoutes as [$method, $uri]) {
            $response = $this->json($method, $uri);
            $response->assertStatus(401);
        }
    }

    public function test_participant_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $this->actingAs($user);

        foreach ($this->adminRoutes as [$method, $uri]) {
            $response = $this->json($method, $uri);
            $response->assertStatus(403);
        }
    }

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $response = $this->getJson('/api/cms/orders');
        $response->assertOk();

        $response = $this->getJson('/api/cms/dashboard');
        $response->assertOk();
    }

    public function test_non_admin_cannot_create_users(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $this->actingAs($user);

        $response = $this->postJson('/api/cms/users', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'Password123!',
            'role' => 'admin',
        ]);

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_update_settings(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $this->actingAs($user);

        $response = $this->postJson('/api/cms/settings', [
            'settings' => ['site_name' => 'Hacked'],
        ]);

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_delete_users(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $target = User::factory()->create();
        $this->actingAs($user);

        $response = $this->deleteJson("/api/cms/users/{$target->id}");
        $response->assertStatus(403);
    }
}
