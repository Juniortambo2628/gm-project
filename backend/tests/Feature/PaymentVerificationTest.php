<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_requires_service_id_field(): void
    {
        $response = $this->postJson('/api/payments/create-checkout', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['service_id']);
    }

    public function test_checkout_requires_name_field(): void
    {
        $response = $this->postJson('/api/payments/create-checkout', [
            'service_id' => 1,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_checkout_requires_email_field(): void
    {
        $response = $this->postJson('/api/payments/create-checkout', [
            'service_id' => 1,
            'name' => 'Test User',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['email']);
    }
}
