<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Without a Calendly webhook (free plan), booked times and cancellations come
 * from Calendly's API using the personal access token.
 */
class CalendlyApiSyncTest extends TestCase
{
    use RefreshDatabase;

    private const EVENT_URI = 'https://api.calendly.com/scheduled_events/EV1';

    private const INVITEE_URI = self::EVENT_URI.'/invitees/INV1';

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.calendly.api_token', 'test-token');
        Config::set('services.stripe.webhook_secret', 'test_webhook_secret_123');
    }

    private function fakeEvent(Carbon $start, int $minutes = 60, string $status = 'active'): void
    {
        Http::fake([
            self::EVENT_URI => Http::response(['resource' => [
                'start_time' => $start->toIso8601String(),
                'end_time' => $start->copy()->addMinutes($minutes)->toIso8601String(),
                'status' => $status,
            ]]),
        ]);
    }

    public function test_payment_records_the_slot_booked_in_calendly(): void
    {
        $start = now()->addDays(6)->setTime(15, 30)->startOfMinute();
        $this->fakeEvent($start, 45);
        $service = Service::factory()->create(['price' => 15]);

        $payload = json_encode([
            'type' => 'checkout.session.completed',
            'data' => ['object' => [
                'id' => 'cs_api_slot',
                'payment_intent' => 'pi_api_slot',
                'payment_status' => 'paid',
                'currency' => 'gbp',
                'amount_total' => 1500,
                'customer_email' => 'client@example.com',
                'metadata' => [
                    'service_id' => (string) $service->id,
                    'customer_name' => 'Client',
                    'calendly_invitee_uri' => self::INVITEE_URI,
                ],
            ]],
        ]);
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$timestamp}.{$payload}", 'test_webhook_secret_123');

        $this->withHeaders(['stripe-signature' => "t={$timestamp},v1={$signature}"])
            ->postJson('/api/webhooks/stripe', json_decode($payload, true))
            ->assertOk();

        $appointment = Appointment::firstOrFail();
        $this->assertTrue($appointment->scheduled_at->equalTo($start));
        $this->assertSame(45, $appointment->duration_minutes);
        $this->assertSame(self::INVITEE_URI, $appointment->calendly_invitee_uri);
    }

    private function scheduledAppointment(Carbon $at): Appointment
    {
        $transaction = Transaction::create([
            'name' => 'Client', 'email' => 'client@example.com', 'amount' => 15, 'currency' => 'GBP',
            'service_id' => Service::factory()->create()->id, 'status' => 'success',
            'calendly_invitee_uri' => self::INVITEE_URI,
        ]);

        return Appointment::factory()->create([
            'transaction_id' => $transaction->id,
            'calendly_invitee_uri' => self::INVITEE_URI,
            'client_email' => 'client@example.com',
            'scheduled_at' => $at,
            'duration_minutes' => 60,
            'status' => 'scheduled',
        ]);
    }

    public function test_sync_corrects_a_placeholder_time(): void
    {
        $real = now()->addDays(4)->setTime(9, 0)->startOfMinute();
        $this->fakeEvent($real, 30);
        $appointment = $this->scheduledAppointment(now()->addDays(2)->setTime(10, 0));

        $this->artisan('bookings:sync-calendly')->assertSuccessful();

        $appointment->refresh();
        $this->assertTrue($appointment->scheduled_at->equalTo($real));
        $this->assertSame(30, $appointment->duration_minutes);
        $this->assertSame('scheduled', $appointment->status);
    }

    public function test_sync_marks_bookings_cancelled_in_calendly(): void
    {
        $at = now()->addDays(3)->setTime(11, 0)->startOfMinute();
        $this->fakeEvent($at, 60, 'canceled');
        $appointment = $this->scheduledAppointment($at);

        $this->artisan('bookings:sync-calendly')->assertSuccessful();

        $this->assertSame('cancelled', $appointment->fresh()->status);
    }

    public function test_sync_does_nothing_without_a_token(): void
    {
        Config::set('services.calendly.api_token', null);
        Http::fake();
        $this->scheduledAppointment(now()->addDays(3));

        $this->artisan('bookings:sync-calendly')->assertSuccessful();

        Http::assertNothingSent();
    }
}
