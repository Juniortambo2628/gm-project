<?php

namespace Tests\Feature\Integration;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FullBookingFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_booking_lifecycle(): void
    {
        // 1. Create a service
        $service = Service::factory()->create([
            'name' => 'MBA Consulting',
            'price' => 50000,
            'duration' => '60 minutes',
        ]);

        // 2. Simulate a user making a payment (Stripe webhook simulation)
        $transaction = Transaction::factory()->create([
            'service_id' => $service->id,
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'amount' => 50000,
            'currency' => 'GBP',
            'stripe_payment_intent_id' => 'pi_unique_ref_001',
            'stripe_checkout_session_id' => 'cs_unique_ref_001',
            'status' => 'success',
        ]);

        // 3. Verify the transaction was recorded
        $this->assertDatabaseHas('transactions', [
            'stripe_checkout_session_id' => 'cs_unique_ref_001',
            'status' => 'success',
        ]);

        // 4. Simulate the appointment creation (normally done by StripeWebhookController)
        $appointment = Appointment::create([
            'transaction_id' => $transaction->id,
            'service_id' => $service->id,
            'client_name' => 'John Doe',
            'client_email' => 'john@example.com',
            'scheduled_at' => now()->addDays(7),
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);

        $this->assertNotNull($appointment);
        $this->assertEquals('john@example.com', $appointment->client_email);
        $this->assertEquals('scheduled', $appointment->status);

        // 5. Admin can see the order
        $admin = $this->createAdmin();
        $response = $this->withHeaders($this->jsonHeaders($admin))
            ->getJson('/api/cms/orders');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');

        // 6. User can see their booking
        $user = User::factory()->create(['email' => 'john@example.com']);
        $response = $this->withHeaders($this->jsonHeaders($user))
            ->getJson('/api/user/bookings');

        $response->assertOk();
    }

    public function test_admin_can_update_order_status(): void
    {
        $admin = $this->createAdmin();
        $transaction = Transaction::factory()->create(['status' => 'success']);

        $response = $this->withHeaders($this->jsonHeaders($admin))
            ->putJson("/api/cms/orders/{$transaction->id}/status", [
                'status' => 'completed',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'status' => 'completed',
        ]);
    }
}
