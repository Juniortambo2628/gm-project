<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class PaystackWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.paystack.webhook_secret', 'test_webhook_secret_123');
    }

    private function generateSignature(string $payload): string
    {
        return hash_hmac('sha512', $payload, 'test_webhook_secret_123');
    }

    public function test_webhook_rejected_without_signature(): void
    {
        $response = $this->postJson('/api/webhooks/paystack', [
            'event' => 'charge.success',
            'data' => ['reference' => 'psk_test'],
        ]);

        $response->assertStatus(400);
    }

    public function test_webhook_rejected_with_invalid_signature(): void
    {
        $payload = json_encode(['event' => 'charge.success']);
        $response = $this->withHeaders(['x-paystack-signature' => 'invalid_signature'])
            ->postJson('/api/webhooks/paystack', json_decode($payload, true));

        $response->assertStatus(400);
    }

    public function test_webhook_ignores_non_charge_events(): void
    {
        $payload = json_encode(['event' => 'invoice.created', 'data' => []]);
        $signature = $this->generateSignature($payload);

        $response = $this->withHeaders(['x-paystack-signature' => $signature])
            ->postJson('/api/webhooks/paystack', json_decode($payload, true));

        $response->assertStatus(200);
        $response->assertJson(['status' => 'ignored']);
    }

    public function test_webhook_handles_duplicate_gracefully(): void
    {
        Service::factory()->create(['id' => 1]);

        Transaction::factory()->create([
            'paystack_ref' => 'psk_duplicate_test',
            'status' => 'success',
        ]);

        $payload = json_encode([
            'event' => 'charge.success',
            'data' => ['reference' => 'psk_duplicate_test'],
        ]);
        $signature = $this->generateSignature($payload);

        $response = $this->withHeaders(['x-paystack-signature' => $signature])
            ->postJson('/api/webhooks/paystack', json_decode($payload, true));

        $response->assertStatus(200);
        $response->assertJson(['status' => 'already_processed']);
        $this->assertDatabaseCount('transactions', 1);
    }

    public function test_webhook_configured_without_secret_returns_500(): void
    {
        Config::set('services.paystack.webhook_secret', null);

        $payload = json_encode(['event' => 'charge.success']);
        $signature = hash_hmac('sha512', $payload, '');

        $response = $this->withHeaders(['x-paystack-signature' => $signature])
            ->postJson('/api/webhooks/paystack', json_decode($payload, true));

        $response->assertStatus(500);
    }
}
