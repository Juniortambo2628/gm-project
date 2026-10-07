<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UnpaidBookingReleaseTest extends TestCase
{
    use RefreshDatabase;

    private const EVENT_URI = 'https://api.calendly.com/scheduled_events/EV1';

    private const INVITEE_URI = self::EVENT_URI.'/invitees/INV1';

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.calendly.api_token', 'test-token');
        Config::set('services.calendly.unpaid_hold_minutes', 120);
        Config::set('services.stripe.secret', null);
    }

    private function reservation(array $overrides = []): Transaction
    {
        $service = Service::factory()->create(['price' => 15]);

        return Transaction::create(array_merge([
            'name' => 'Client',
            'email' => 'client@example.com',
            'amount' => 15,
            'currency' => 'GBP',
            'service_id' => $service->id,
            'calendly_invitee_uri' => self::INVITEE_URI,
            'status' => 'pending',
        ], $overrides));
    }

    private function fakeCalendly(string $inviteeEmail = 'client@example.com'): void
    {
        Http::fake([
            self::INVITEE_URI => Http::response(['resource' => ['email' => $inviteeEmail, 'status' => 'active']]),
            self::EVENT_URI.'/cancellation' => Http::response(['resource' => []], 201),
        ]);
    }

    public function test_reserve_requires_authentication(): void
    {
        $service = Service::factory()->create(['price' => 15]);

        $this->postJson('/api/bookings/reserve', [
            'service_id' => $service->id,
            'calendly_invitee_uri' => self::INVITEE_URI,
        ])->assertUnauthorized();
    }

    public function test_reserve_records_pending_reservation_with_hold_expiry(): void
    {
        Sanctum::actingAs(User::factory()->create(['email' => 'client@example.com']));
        $service = Service::factory()->create(['price' => 15]);

        $this->postJson('/api/bookings/reserve', [
            'service_id' => $service->id,
            'calendly_invitee_uri' => self::INVITEE_URI,
        ])->assertCreated()->assertJsonPath('data.transaction_status', 'pending')
            ->assertJsonStructure(['data' => ['hold_expires_at']]);

        $this->assertDatabaseHas('transactions', [
            'calendly_invitee_uri' => self::INVITEE_URI,
            'email' => 'client@example.com',
            'status' => 'pending',
        ]);
    }

    public function test_expired_unpaid_reservation_is_cancelled_on_calendly(): void
    {
        $this->fakeCalendly();
        $transaction = $this->reservation();
        $transaction->forceFill(['created_at' => now()->subMinutes(121)])->save();
        $appointment = Appointment::factory()->create([
            'calendly_invitee_uri' => self::INVITEE_URI,
            'client_email' => 'client@example.com',
            'status' => 'scheduled',
        ]);

        $this->artisan('bookings:release-unpaid')->assertSuccessful();

        Http::assertSent(fn ($request) => $request->url() === self::EVENT_URI.'/cancellation'
            && $request->hasHeader('Authorization', 'Bearer test-token'));
        $this->assertSame('cancelled', $transaction->fresh()->status);
        $this->assertSame('cancelled', $appointment->fresh()->status);
    }

    public function test_reservation_within_hold_window_is_kept(): void
    {
        $this->fakeCalendly();
        $transaction = $this->reservation();
        $transaction->forceFill(['created_at' => now()->subMinutes(60)])->save();

        $this->artisan('bookings:release-unpaid')->assertSuccessful();

        Http::assertNothingSent();
        $this->assertSame('pending', $transaction->fresh()->status);
    }

    public function test_reservation_is_not_released_when_invitee_email_differs(): void
    {
        $this->fakeCalendly('someone-else@example.com');
        $transaction = $this->reservation();
        $transaction->forceFill(['created_at' => now()->subMinutes(121)])->save();

        $this->artisan('bookings:release-unpaid')->assertSuccessful();

        Http::assertNotSent(fn ($request) => str_ends_with($request->url(), '/cancellation'));
        $this->assertSame('pending', $transaction->fresh()->status);
    }

    public function test_nothing_happens_without_api_token(): void
    {
        Config::set('services.calendly.api_token', null);
        Http::fake();
        $transaction = $this->reservation();
        $transaction->forceFill(['created_at' => now()->subMinutes(121)])->save();

        $this->artisan('bookings:release-unpaid')->assertSuccessful();

        Http::assertNothingSent();
        $this->assertSame('pending', $transaction->fresh()->status);
    }

    public function test_checkout_refused_for_released_slot(): void
    {
        $transaction = $this->reservation(['status' => 'cancelled']);

        $this->postJson('/api/payments/create-checkout', [
            'service_id' => $transaction->service_id,
            'name' => 'Client',
            'email' => 'client@example.com',
            'calendly_invitee_uri' => self::INVITEE_URI,
        ])->assertStatus(410)->assertJsonPath('code', 'slot_released');
    }

    public function test_checkout_refused_for_free_service(): void
    {
        $service = Service::factory()->create(['price' => 0, 'is_active' => true]);

        $this->postJson('/api/payments/create-checkout', [
            'service_id' => $service->id,
            'name' => 'Client',
            'email' => 'client@example.com',
        ])->assertStatus(422);
    }

    public function test_discovery_service_is_retired_by_migration(): void
    {
        $discovery = Service::factory()->create(['name' => 'Discovery Call', 'type' => 'discovery', 'price' => 0, 'is_active' => true]);
        $mba = Service::factory()->create(['type' => 'mba', 'is_active' => true]);

        $migration = require database_path('migrations/2026_10_07_110000_retire_discovery_call_service.php');
        $migration->up();

        $this->assertFalse((bool) $discovery->fresh()->is_active);
        $this->assertTrue((bool) $mba->fresh()->is_active);
        $this->getJson('/api/services')->assertJsonMissing(['name' => 'Discovery Call']);
    }

    public function test_payment_on_earlier_checkout_session_still_settles_reservation(): void
    {
        Config::set('services.stripe.webhook_secret', 'test_webhook_secret_123');
        $transaction = $this->reservation(['stripe_checkout_session_id' => 'cs_retry']);

        $payload = json_encode([
            'type' => 'checkout.session.completed',
            'data' => ['object' => [
                'id' => 'cs_first_attempt',
                'payment_intent' => 'pi_1',
                'payment_status' => 'paid',
                'currency' => 'gbp',
                'amount_total' => 1500,
                'customer_email' => 'client@example.com',
                'metadata' => [
                    'service_id' => (string) $transaction->service_id,
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

        $this->assertSame(1, Transaction::count());
        $this->assertSame('success', $transaction->fresh()->status);
    }
}
