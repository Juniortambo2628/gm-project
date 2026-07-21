<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_verify_requires_reference_field(): void
    {
        $response = $this->postJson('/api/payments/verify', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['reference']);
    }

    public function test_verify_returns_500_without_paystack_secret(): void
    {
        config(['services.paystack.secret' => null]);

        $response = $this->postJson('/api/payments/verify', [
            'reference' => 'psk_test_123',
        ]);

        $response->assertStatus(500);
    }
}
