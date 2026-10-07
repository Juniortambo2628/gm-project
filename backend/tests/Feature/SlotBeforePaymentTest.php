<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

/**
 * Clients reserve a Calendly slot first and pay afterwards. These tests cover
 * linking the Calendly booking to the Stripe payment in either webhook order.
 */
class SlotBeforePaymentTest extends TestCase
{
    use RefreshDatabase;

    private const INVITEE_URI = 'https://api.calendly.com/scheduled_events/EV1/invitees/INV1';

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.stripe.webhook_secret', 'test_webhook_secret_123');
    }

    private function postStripeCompleted(string $sessionId, array $metadata): void
    {
        $payload = json_encode([
            'type' => 'checkout.session.completed',
            'data' => [
                'object' => [
                    'id' => $sessionId,
                    'payment_intent' => 'pi_'.$sessionId,
                    'payment_status' => 'paid',
                    'currency' => 'gbp',
                    'amount_total' => 1500,
                    'customer_email' => 'client@example.com',
                    'metadata' => $metadata,
                ],
            ],
        ]);
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", 'test_webhook_secret_123');

        $this->withHeaders(['stripe-signature' => "t={$timestamp},v1={$signature}"])
            ->postJson('/api/webhooks/stripe', json_decode($payload, true))
            ->assertOk();
    }

    private function postCalendlyCreated(string $startTime): void
    {
        // Calendly v2 webhook shape
        $this->postJson('/api/webhooks/calendly', [
            'event' => 'invitee.created',
            'payload' => [
                'uri' => self::INVITEE_URI,
                'name' => 'Client',
                'email' => 'client@example.com',
                'scheduled_event' => [
                    'start_time' => $startTime,
                    'end_time' => Carbon::parse($startTime)->addHour()->toIso8601String(),
                ],
            ],
        ])->assertOk();
    }

    public function test_payment_links_to_slot_booked_earlier(): void
    {
        $service = Service::factory()->create();
        $start = now()->addDays(5)->setTime(14, 0)->toIso8601String();

        $this->postCalendlyCreated($start);
        $appointment = Appointment::where('calendly_invitee_uri', self::INVITEE_URI)->firstOrFail();
        $this->assertNull($appointment->transaction_id);

        Transaction::create([
            'name' => 'Client',
            'email' => 'client@example.com',
            'amount' => 15,
            'currency' => 'GBP',
            'service_id' => $service->id,
            'stripe_checkout_session_id' => 'cs_slot_first',
            'calendly_invitee_uri' => self::INVITEE_URI,
            'status' => 'pending',
        ]);

        $this->postStripeCompleted('cs_slot_first', [
            'service_id' => (string) $service->id,
            'customer_name' => 'Client',
            'calendly_invitee_uri' => self::INVITEE_URI,
        ]);

        $transaction = Transaction::where('stripe_checkout_session_id', 'cs_slot_first')->firstOrFail();
        $this->assertSame(1, Appointment::count());
        $appointment->refresh();
        $this->assertSame($transaction->id, $appointment->transaction_id);
        $this->assertSame($service->id, $appointment->service_id);
        $this->assertTrue($appointment->scheduled_at->equalTo(Carbon::parse($start)));
    }

    public function test_late_calendly_webhook_fills_in_placeholder_slot(): void
    {
        $service = Service::factory()->create();

        $this->postStripeCompleted('cs_stripe_first', [
            'service_id' => (string) $service->id,
            'customer_name' => 'Client',
            'calendly_invitee_uri' => self::INVITEE_URI,
        ]);

        $start = now()->addDays(7)->setTime(9, 30)->toIso8601String();
        $this->postCalendlyCreated($start);

        $this->assertSame(1, Appointment::count());
        $appointment = Appointment::firstOrFail();
        $this->assertNotNull($appointment->transaction_id);
        $this->assertTrue($appointment->scheduled_at->equalTo(Carbon::parse($start)));
    }

    public function test_checkout_rejects_non_calendly_invitee_uri(): void
    {
        $service = Service::factory()->create();

        $this->postJson('/api/payments/create-checkout', [
            'service_id' => $service->id,
            'name' => 'Client',
            'email' => 'client@example.com',
            'calendly_invitee_uri' => 'https://evil.example.com/x',
        ])->assertStatus(422)->assertJsonValidationErrors('calendly_invitee_uri');
    }
}
