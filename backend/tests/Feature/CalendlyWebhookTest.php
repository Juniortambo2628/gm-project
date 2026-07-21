<?php

namespace Tests\Feature;

use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendlyWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_webhook_returns_ignored_for_unknown_event(): void
    {
        $response = $this->postJson('/api/webhooks/calendly', [
            'event' => 'unknown.event',
        ]);

        $response->assertOk();
        $response->assertJson(['status' => 'ok']);
    }

    public function test_webhook_returns_ignored_without_event(): void
    {
        $response = $this->postJson('/api/webhooks/calendly', []);

        $response->assertOk();
        $response->assertJson(['status' => 'ignored']);
    }

    public function test_webhook_handles_invitee_created(): void
    {
        $payload = [
            'event' => 'invitee.created',
            'payload' => [
                'invitee' => [
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                ],
                'event' => [
                    'start_time' => now()->addDays(2)->toIso8601String(),
                    'end_time' => now()->addDays(2)->addHour()->toIso8601String(),
                ],
            ],
        ];

        $response = $this->postJson('/api/webhooks/calendly', $payload);

        $response->assertOk();
        $this->assertDatabaseHas('appointments', [
            'client_email' => 'test@example.com',
            'status' => 'scheduled',
        ]);
    }

    public function test_webhook_handles_invitee_canceled(): void
    {
        $appointment = Appointment::factory()->create([
            'client_email' => 'cancel@example.com',
            'status' => 'scheduled',
        ]);

        $payload = [
            'event' => 'invitee.canceled',
            'payload' => [
                'invitee' => [
                    'email' => 'cancel@example.com',
                ],
            ],
        ];

        $response = $this->postJson('/api/webhooks/calendly', $payload);

        $response->assertOk();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'cancelled',
        ]);
    }
}
