<?php

namespace Tests\Feature;

use App\Models\MailTemplate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MailTemplateTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_list_mail_templates(): void
    {
        MailTemplate::factory()->create(['key' => 'welcome']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/mail-templates');

        $response->assertOk();
    }

    public function test_admin_can_get_single_template(): void
    {
        MailTemplate::factory()->create(['key' => 'welcome']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/mail-templates/welcome');

        $response->assertOk();
    }

    public function test_admin_can_update_template(): void
    {
        MailTemplate::factory()->create(['key' => 'welcome']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->putJson('/api/cms/mail-templates/welcome', [
                'subject' => 'Updated Subject',
                'body' => '<h1>Updated Body</h1>',
            ]);

        $response->assertOk();
    }

    public function test_admin_can_preview_template(): void
    {
        MailTemplate::factory()->create(['key' => 'welcome']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/mail-templates/welcome/preview');

        $response->assertOk();
        $response->assertJsonStructure(['subject', 'html', 'placeholders']);
    }

    public function test_admin_can_reset_template(): void
    {
        $template = MailTemplate::factory()->create(['key' => 'welcome']);
        $template->update(['subject' => 'Custom Subject']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/mail-templates/welcome/reset');

        $response->assertOk();
    }

    public function test_participant_cannot_access_mail_templates(): void
    {
        $user = $this->createParticipant();

        $response = $this->withHeaders($this->jsonHeaders($user))
            ->getJson('/api/cms/mail-templates');

        $response->assertForbidden();
    }
}
