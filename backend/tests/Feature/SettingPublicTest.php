<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingPublicTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_settings_endpoint_returns_grouped_settings(): void
    {
        Setting::set('site_name', 'Test Site', 'general');
        Setting::set('about_headline', 'About Us', 'about');

        $response = $this->getJson('/api/settings');

        $response->assertOk();
    }

    public function test_public_settings_key_endpoint_returns_value(): void
    {
        Setting::set('site_name', 'Test Site', 'general');

        $response = $this->getJson('/api/settings/site_name');

        $response->assertOk();
        $response->assertJsonFragment(['value' => 'Test Site']);
    }

    public function test_public_settings_key_blocks_security_group(): void
    {
        Setting::set('paystack_secret', 'sk_test_123', 'security');

        $response = $this->getJson('/api/settings/paystack_secret');

        $response->assertForbidden();
    }

    public function test_public_settings_key_returns_404_for_missing(): void
    {
        $response = $this->getJson('/api/settings/nonexistent_key');

        $response->assertNotFound();
    }
}
