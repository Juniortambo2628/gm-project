<?php

namespace Tests\Feature;

use App\Models\IntegrationTestResult;
use App\Models\Setting;
use App\Models\User;
use App\Services\IntegrationTestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class IntegrationTestServiceTest extends TestCase
{
    use RefreshDatabase;

    protected IntegrationTestService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(IntegrationTestService::class);

        // Any real outbound request should fail the test loudly. Each test
        // registers exactly the stubs it needs. We deliberately do NOT set a
        // catch-all here: Http::fake matches the first registered stub, so a
        // catch-all in setUp would shadow per-test overrides.
        Http::preventStrayRequests();
    }

    // ─── Calendly ───────────────────────────────────────────────────

    /**
     * Regression: the discovery URL was removed from the CMS, which made the
     * null-coalescing fallback evaluate reset(array_filter($urls)). Passing a
     * function result to reset() (by-reference) threw "Only variables should
     * be passed by reference". The verifier must now fall back cleanly to the
     * next configured URL without erroring.
     */
    public function test_calendly_does_not_error_when_discovery_url_is_missing(): void
    {
        Setting::set('mba_calendly_url', 'https://calendly.com/gm/mba');
        Setting::set('consulting_calendly_url', 'https://calendly.com/gm/consulting');
        Http::fake(['calendly.com/*' => Http::response('ok', 200)]);

        $result = $this->service->test('calendly');

        $this->assertNotSame('error', $result['status']);
        $this->assertTrue($result['connected']);
        $this->assertStringNotContainsStringIgnoringCase('by reference', $result['message']);
        $this->assertSame(2, $result['details']['configured_count']);
        $this->assertNull($result['details']['discovery_url']);
    }

    public function test_calendly_warns_when_no_urls_configured(): void
    {
        $result = $this->service->test('calendly');

        $this->assertSame('warning', $result['status']);
        $this->assertFalse($result['configured']);
        $this->assertFalse($result['connected']);
        $this->assertStringContainsString('No Calendly URLs configured', $result['message']);
        $this->assertSame(0, $result['details']['configured_count']);
    }

    public function test_calendly_is_ok_when_all_three_urls_are_reachable(): void
    {
        Setting::set('discovery_calendly_url', 'https://calendly.com/gm/discovery');
        Setting::set('mba_calendly_url', 'https://calendly.com/gm/mba');
        Setting::set('consulting_calendly_url', 'https://calendly.com/gm/consulting');
        Http::fake(['calendly.com/*' => Http::response('ok', 200)]);

        $result = $this->service->test('calendly');

        $this->assertSame('ok', $result['status']);
        $this->assertTrue($result['connected']);
        $this->assertSame(3, $result['details']['configured_count']);
    }

    public function test_calendly_handles_unreachable_url_gracefully(): void
    {
        Setting::set('discovery_calendly_url', 'https://calendly.com/gm/discovery');
        Http::fake(['calendly.com/*' => fn () => throw new ConnectionException('Connection timed out')]);

        $result = $this->service->test('calendly');

        $this->assertSame('error', $result['status']);
        $this->assertFalse($result['connected']);
        $this->assertStringContainsString('Could not verify Calendly URL', $result['message']);
        $this->assertArrayHasKey('error', $result['details']);
    }

    // ─── Stripe ─────────────────────────────────────────────────────

    public function test_stripe_warns_when_keys_are_missing(): void
    {
        config(['services.stripe.secret' => null, 'services.stripe.publishable' => null]);

        $result = $this->service->test('stripe');

        $this->assertSame('warning', $result['status']);
        $this->assertFalse($result['configured']);
    }

    public function test_stripe_is_ok_when_keys_are_valid(): void
    {
        config([
            'services.stripe.secret' => 'sk_test_valid',
            'services.stripe.publishable' => 'pk_test_valid',
            'services.stripe.webhook_secret' => 'whsec_test',
        ]);
        Http::fake(['api.stripe.com/*' => Http::response(['object' => 'balance'], 200)]);

        $result = $this->service->test('stripe');

        $this->assertSame('ok', $result['status']);
        $this->assertTrue($result['connected']);
        $this->assertTrue($result['details']['has_webhook_secret']);
    }

    public function test_stripe_warns_when_webhook_secret_is_missing(): void
    {
        config([
            'services.stripe.secret' => 'sk_test_valid',
            'services.stripe.publishable' => 'pk_test_valid',
            'services.stripe.webhook_secret' => null,
        ]);
        Http::fake(['api.stripe.com/*' => Http::response(['object' => 'balance'], 200)]);

        $result = $this->service->test('stripe');

        $this->assertSame('warning', $result['status']);
        $this->assertStringContainsString('STRIPE_WEBHOOK_SECRET', $result['message']);
    }

    public function test_stripe_reports_error_on_invalid_keys(): void
    {
        config([
            'services.stripe.secret' => 'sk_test_bad',
            'services.stripe.publishable' => 'pk_test_bad',
        ]);
        Http::fake(['api.stripe.com/*' => Http::response(['error' => 'invalid'], 401)]);

        $result = $this->service->test('stripe');

        $this->assertSame('error', $result['status']);
        $this->assertFalse($result['connected']);
    }

    // ─── SMTP / Pusher / S3 ─────────────────────────────────────────

    public function test_smtp_warns_for_non_delivering_driver(): void
    {
        // The testing environment uses the "array" mail driver.
        $result = $this->service->test('smtp');

        $this->assertSame('warning', $result['status']);
        $this->assertTrue($result['connected']);
        $this->assertStringContainsString('not delivered', $result['message']);
    }

    public function test_pusher_warns_when_unconfigured(): void
    {
        config([
            'broadcasting.connections.pusher.app_id' => null,
            'broadcasting.connections.pusher.key' => null,
            'broadcasting.connections.pusher.secret' => null,
        ]);

        $result = $this->service->test('pusher');

        $this->assertSame('warning', $result['status']);
        $this->assertFalse($result['configured']);
    }

    public function test_pusher_is_ok_when_configured(): void
    {
        config([
            'broadcasting.connections.pusher.app_id' => '12345',
            'broadcasting.connections.pusher.key' => 'key',
            'broadcasting.connections.pusher.secret' => 'secret',
            'broadcasting.connections.pusher.options.cluster' => 'ap1',
        ]);

        $result = $this->service->test('pusher');

        $this->assertSame('ok', $result['status']);
        $this->assertTrue($result['connected']);
        $this->assertStringContainsString('ap1', $result['message']);
    }

    public function test_s3_warns_when_unconfigured(): void
    {
        config([
            'filesystems.disks.s3.key' => null,
            'filesystems.disks.s3.secret' => null,
            'filesystems.disks.s3.bucket' => null,
        ]);

        $result = $this->service->test('s3');

        $this->assertSame('warning', $result['status']);
        $this->assertFalse($result['configured']);
    }

    // ─── Google Fonts / Backend API ─────────────────────────────────

    public function test_google_fonts_is_ok_when_reachable(): void
    {
        Http::fake(['fonts.googleapis.com/*' => Http::response('/* font css */', 200)]);

        $result = $this->service->test('google_fonts');

        $this->assertSame('ok', $result['status']);
        $this->assertTrue($result['connected']);
    }

    public function test_backend_api_is_ok_when_settings_endpoint_responds(): void
    {
        Http::fake(['*/api/settings' => Http::response(['data' => []], 200)]);

        $result = $this->service->test('backend_api');

        $this->assertSame('ok', $result['status']);
        $this->assertTrue($result['connected']);
    }

    // ─── Aggregate + dispatch ───────────────────────────────────────

    public function test_all_returns_every_integration_and_persists_results(): void
    {
        Http::fake(['*' => Http::response('ok', 200)]);

        $results = $this->service->all();

        $keys = array_column($results, 'key');
        $this->assertEqualsCanonicalizing(
            ['stripe', 'smtp', 'calendly', 'pusher', 's3', 'backend_api', 'google_fonts'],
            $keys
        );

        // Each result is persisted exactly once (updateOrCreate keyed by `key`).
        $this->assertSame(7, IntegrationTestResult::count());
        foreach ($keys as $key) {
            $this->assertDatabaseHas('integration_test_results', ['key' => $key]);
        }
    }

    public function test_running_all_twice_updates_rather_than_duplicates(): void
    {
        Http::fake(['*' => Http::response('ok', 200)]);

        $this->service->all();
        $this->service->all();

        $this->assertSame(7, IntegrationTestResult::count());
    }

    public function test_unknown_key_returns_error_result(): void
    {
        $result = $this->service->test('does_not_exist');

        $this->assertSame('error', $result['status']);
        $this->assertFalse($result['configured']);
        $this->assertStringContainsString('Unknown integration key', $result['message']);
    }

    // ─── Controller / authorization ─────────────────────────────────

    public function test_integrations_index_requires_authentication(): void
    {
        $this->getJson('/api/cms/integrations')->assertUnauthorized();
    }

    public function test_integrations_index_is_forbidden_for_participants(): void
    {
        $user = $this->createParticipant();

        $this->withHeaders($this->jsonHeaders($user))
            ->getJson('/api/cms/integrations')
            ->assertForbidden();
    }

    public function test_admin_can_list_integrations_and_results_are_seeded_when_empty(): void
    {
        Http::fake(['*' => Http::response('ok', 200)]);
        $admin = $this->createAdmin();

        $this->assertSame(0, IntegrationTestResult::count());

        $response = $this->withHeaders($this->jsonHeaders($admin))
            ->getJson('/api/cms/integrations');

        $response->assertOk();
        $this->assertSame(7, IntegrationTestResult::count());
    }

    public function test_admin_can_test_a_single_integration(): void
    {
        $admin = $this->createAdmin();

        $response = $this->withHeaders($this->jsonHeaders($admin))
            ->postJson('/api/cms/integrations/test/pusher');

        $response->assertOk()
            ->assertJsonPath('data.key', 'pusher');
    }

    public function test_admin_can_test_all_integrations(): void
    {
        Http::fake(['*' => Http::response('ok', 200)]);
        $admin = $this->createAdmin();

        $response = $this->withHeaders($this->jsonHeaders($admin))
            ->postJson('/api/cms/integrations/test-all');

        $response->assertOk()
            ->assertJsonCount(7, 'data');
    }

    public function test_send_test_email_validates_the_recipient(): void
    {
        $admin = $this->createAdmin();

        $this->withHeaders($this->jsonHeaders($admin))
            ->postJson('/api/cms/integrations/send-test-email', ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }
}
