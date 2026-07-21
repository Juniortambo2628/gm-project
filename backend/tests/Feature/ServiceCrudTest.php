<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_create_service(): void
    {
        $payload = [
            'name' => 'New Consulting Service',
            'type' => 'consulting',
            'price' => 75000,
            'currency' => 'USD',
            'duration' => '8 weeks',
            'features' => ['Case Prep', 'Mock Interviews'],
            'description' => 'Premium consulting prep',
            'is_active' => true,
        ];

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/services', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('services', ['name' => 'New Consulting Service']);
    }

    public function test_admin_can_update_service(): void
    {
        $service = Service::factory()->create(['name' => 'Old Name']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->putJson("/api/cms/services/{$service->id}", [
                'name' => 'Updated Name',
                'type' => $service->type,
                'duration' => $service->duration,
                'price' => $service->price,
                'currency' => $service->currency,
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('services', ['id' => $service->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_delete_service(): void
    {
        $service = Service::factory()->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->deleteJson("/api/cms/services/{$service->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('services', ['id' => $service->id]);
    }

    public function test_participant_cannot_create_service(): void
    {
        $user = $this->createParticipant();

        $response = $this->withHeaders($this->jsonHeaders($user))
            ->postJson('/api/cms/services', [
                'name' => 'Unauthorized Service',
                'type' => 'mba',
                'price' => 10000,
                'currency' => 'USD',
            ]);

        $response->assertForbidden();
    }

    public function test_service_validation_requires_name_and_type(): void
    {
        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/services', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['name', 'type']);
    }
}
