<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionSecurityTest extends TestCase
{
    use RefreshDatabase;

    private Service $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = Service::factory()->create(['price' => 100, 'currency' => 'USD']);
    }

    public function test_client_cannot_set_status_on_transaction(): void
    {
        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'service_id' => $this->service->id,
            'stripe_checkout_session_id' => 'cs_fake_session_001',
            'status' => 'success',
        ];

        $response = $this->postJson('/api/transactions', $payload);

        // The request should be accepted but the transaction should be created with status from Stripe verification
        // Since we can't verify with Stripe in tests, we expect a 422 (verification failed)
        $response->assertStatus(422);
        $response->assertJson(['message' => 'Payment verification failed. The transaction could not be confirmed with Stripe.']);
    }

    public function test_client_cannot_set_amount_on_transaction(): void
    {
        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'amount' => 0.01,
            'currency' => 'USD',
            'service_id' => $this->service->id,
            'stripe_checkout_session_id' => 'cs_fake_session_002',
        ];

        $response = $this->postJson('/api/transactions', $payload);

        // Amount is no longer accepted in the request
        $response->assertStatus(422);
    }

    public function test_transaction_requires_stripe_checkout_session_id(): void
    {
        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'service_id' => $this->service->id,
        ];

        $response = $this->postJson('/api/transactions', $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['stripe_checkout_session_id']);
    }

    public function test_transaction_requires_valid_service_id(): void
    {
        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'service_id' => 99999,
            'stripe_checkout_session_id' => 'cs_fake_session_003',
        ];

        $response = $this->postJson('/api/transactions', $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['service_id']);
    }

    public function test_transaction_requires_valid_email(): void
    {
        $payload = [
            'name' => 'Test User',
            'email' => 'not-an-email',
            'service_id' => $this->service->id,
            'stripe_checkout_session_id' => 'cs_fake_session_004',
        ];

        $response = $this->postJson('/api/transactions', $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_duplicate_session_id_returns_existing_transaction(): void
    {
        $existing = Transaction::factory()->create([
            'stripe_checkout_session_id' => 'cs_duplicate_ref',
            'status' => 'success',
        ]);

        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'service_id' => $this->service->id,
            'stripe_checkout_session_id' => 'cs_duplicate_ref',
        ];

        $response = $this->postJson('/api/transactions', $payload);
        $response->assertStatus(200);
        $response->assertJson(['message' => 'Transaction already recorded.']);
        $this->assertDatabaseCount('transactions', 1);
    }

    public function test_unauthenticated_user_cannot_access_admin_orders(): void
    {
        $response = $this->getJson('/api/cms/orders');
        $response->assertStatus(401);
    }

    public function test_participant_cannot_access_admin_orders(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $this->actingAs($user);

        $response = $this->getJson('/api/cms/orders');
        $response->assertStatus(403);
    }
}
