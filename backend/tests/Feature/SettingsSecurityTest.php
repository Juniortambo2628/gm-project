<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_settings_endpoint_does_not_expose_secrets(): void
    {
        // Seed some settings
        Setting::set('site_name', 'Test Site', 'general');
        Setting::set('admin_2fa_enabled', '1', 'security');
        Setting::set('temp_2fa_code_1', '123456', 'security');
        Setting::set('admin_2fa_backup_codes', '["1111-2222"]', 'security');

        $response = $this->getJson('/api/settings');
        $response->assertOk();

        $content = $response->getContent();

        // Security group settings should NOT be exposed
        $this->assertStringNotContainsString('admin_2fa_enabled', $content);
        $this->assertStringNotContainsString('temp_2fa_code', $content);
        $this->assertStringNotContainsString('admin_2fa_backup_codes', $content);
    }

    public function test_public_settings_key_endpoint_blocks_security_keys(): void
    {
        Setting::set('admin_2fa_enabled', '1', 'security');

        $response = $this->getJson('/api/settings/admin_2fa_enabled');
        // Should return 403 for security group
        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_update_settings(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $this->actingAs($user);

        $response = $this->postJson('/api/settings', [
            'settings' => ['general' => ['site_name' => 'Hacked']],
        ]);

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_update_cms_settings(): void
    {
        $user = User::factory()->create(['role' => 'participant']);
        $this->actingAs($user);

        $response = $this->postJson('/api/cms/settings', [
            'settings' => ['admin_2fa_enabled' => '0'],
        ]);

        $response->assertStatus(403);
    }
}
