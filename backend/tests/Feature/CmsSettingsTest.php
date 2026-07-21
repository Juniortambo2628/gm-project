<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CmsSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_update_cms_settings(): void
    {
        $payload = [
            'settings' => [
                'site_name' => 'New Site Name',
                'hero_tagline' => 'New Tagline',
            ],
        ];

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/settings', $payload);

        $response->assertOk();
        $this->assertEquals('New Site Name', Setting::get('site_name'));
    }

    public function test_participant_cannot_update_cms_settings(): void
    {
        $user = $this->createParticipant();

        $response = $this->withHeaders($this->jsonHeaders($user))
            ->postJson('/api/cms/settings', ['settings' => ['site_name' => 'Hacked']]);

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_update_cms_settings(): void
    {
        $response = $this->postJson('/api/cms/settings', ['settings' => ['site_name' => 'Hacked']]);

        $response->assertUnauthorized();
    }
}
