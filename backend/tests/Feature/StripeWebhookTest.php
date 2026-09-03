<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.stripe.webhook_secret', 'test_webhook_secret_123');
    }

    private function generateSignature(string $payload): string
    {
        $timestamp = time();
        $signedPayload = "{$timestamp}.{$payload}";
        $signature = hash_hmac('sha256', $signedPayload, 'test_webhook_secret_123');

        return "t={$timestamp},v1={$signature}";
    }

    public function test_webhook_rejected_without_signature(): void
    {
        $response = $this->postJson('/api/webhooks/stripe', [
            'type' => 'checkout.session.completed',
            'data' => ['object' => ['id' => 'cs_test']],
        ]);

        $response->assertStatus(400);
    }

    public function test_webhook_rejected_with_invalid_signature(): void
    {
        $payload = json_encode(['type' => 'checkout.session.completed']);
        $response = $this->withHeaders(['stripe-signature' => 'invalid_signature'])
            ->postJson('/api/webhooks/stripe', json_decode($payload, true));

        $response->assertStatus(400);
    }

    public function test_webhook_ignores_non_checkout_events(): void
    {
        $payload = json_encode(['type' => 'invoice.created', 'data' => ['object' => []]]);
        $signature = $this->generateSignature($payload);

        $response = $this->withHeaders(['stripe-signature' => $signature])
            ->postJson('/api/webhooks/stripe', json_decode($payload, true));

        $response->assertStatus(200);
        $response->assertJson(['status' => 'ignored']);
    }

    public function test_webhook_handles_duplicate_gracefully(): void
    {
        Service::factory()->create(['id' => 1]);

        Transaction::factory()->create([
            'stripe_checkout_session_id' => 'cs_duplicate_test',
            'status' => 'success',
        ]);

        $payload = json_encode([
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_duplicate_test',
                    'payment_intent' => 'pi_123',
                    'payment_status' => 'paid',
                    'currency' => 'gbp',
                    'amount_total' => 5000,
                    'customer_email' => 'test@example.com',
                    'metadata' => [
                        'customer_name' => 'Test User',
                        'service_id' => '1',
                    ],
                ],
            ],
        ]);
        $signature = $this->generateSignature($payload);

        $response = $this->withHeaders(['stripe-signature' => $signature])
            ->postJson('/api/webhooks/stripe', json_decode($payload, true));

        $response->assertStatus(200);
        $response->assertJson(['status' => 'already_processed']);
        $this->assertDatabaseCount('transactions', 1);
    }

    public function test_webhook_configured_without_secret_returns_400(): void
    {
        Config::set('services.stripe.webhook_secret', null);

        $payload = json_encode(['type' => 'checkout.session.completed']);
        $signature = $this->generateSignature($payload);

        $response = $this->withHeaders(['stripe-signature' => $signature])
            ->postJson('/api/webhooks/stripe', json_decode($payload, true));

        $response->assertStatus(400);
    }

    public function test_webhook_processes_successful_payment(): void
    {
        Service::factory()->create(['id' => 1]);

        $payload = json_encode([
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_new_session',
                    'payment_intent' => 'pi_new_payment',
                    'payment_status' => 'paid',
                    'currency' => 'gbp',
                    'amount_total' => 10000,
                    'customer_email' => 'new@example.com',
                    'metadata' => [
                        'customer_name' => 'New Customer',
                        'service_id' => '1',
                        'service_name' => 'MBA Consulting',
                    ],
                ],
            ],
        ]);
        $signature = $this->generateSignature($payload);

        $response = $this->withHeaders(['stripe-signature' => $signature])
            ->postJson('/api/webhooks/stripe', json_decode($payload, true));

        $response->assertStatus(200);
        $response->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('transactions', [
            'stripe_checkout_session_id' => 'cs_new_session',
            'stripe_payment_intent_id' => 'pi_new_payment',
            'status' => 'success',
            'email' => 'new@example.com',
            'amount' => 100.00,
        ]);

        $this->assertDatabaseHas('appointments', [
            'client_email' => 'new@example.com',
            'status' => 'scheduled',
        ]);
    }

    public function test_webhook_creates_transaction_when_not_pre_created(): void
    {
        Service::factory()->create(['id' => 1]);

        $payload = json_encode([
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => 'cs_no_precreate',
                    'payment_intent' => 'pi_no_precreate',
                    'payment_status' => 'paid',
                    'currency' => 'gbp',
                    'amount_total' => 7500,
                    'customer_email' => 'direct@example.com',
                    'metadata' => [
                        'customer_name' => 'Direct Customer',
                        'service_id' => '1',
                    ],
                ],
            ],
        ]);
        $signature = $this->generateSignature($payload);

        $response = $this->withHeaders(['stripe-signature' => $signature])
            ->postJson('/api/webhooks/stripe', json_decode($payload, true));

        $response->assertStatus(200);

        $this->assertDatabaseHas('transactions', [
            'stripe_checkout_session_id' => 'cs_no_precreate',
            'email' => 'direct@example.com',
            'amount' => 75.00,
            'currency' => 'GBP',
            'status' => 'success',
        ]);
    }
}
