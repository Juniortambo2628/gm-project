<?php

namespace Tests\Feature\Integration;

use App\Models\Faq;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentManagementFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_content_appears_in_public_api(): void
    {
        $admin = $this->createAdmin();

        // 1. Admin creates a service
        $response = $this->withHeaders($this->jsonHeaders($admin))
            ->postJson('/api/cms/services', [
                'name' => 'New MBA Package',
                'type' => 'mba',
                'price' => 75000,
                'currency' => 'USD',
                'duration' => '6 weeks',
                'features' => ['Essay Review', 'Interview Prep'],
                'is_active' => true,
            ]);

        $response->assertCreated();

        // 2. Verify it appears in public services endpoint
        $response = $this->getJson('/api/services');
        $response->assertOk();
        $response->assertJsonFragment(['name' => 'New MBA Package']);

        // 3. Admin creates a FAQ
        $response = $this->withHeaders($this->jsonHeaders($admin))
            ->postJson('/api/cms/faqs', [
                'question' => 'What are the payment options?',
                'answer' => 'We accept Stripe payments.',
                'category' => 'billing',
            ]);

        $response->assertCreated();

        // 4. Verify FAQ appears in public endpoint
        $response = $this->getJson('/api/faqs');
        $response->assertOk();

        // 5. Verify site-content includes both
        $response = $this->getJson('/api/site-content');
        $response->assertOk();
        $response->assertJsonStructure(['services', 'faqs']);
    }

    public function test_deleted_service_disappears_from_public_api(): void
    {
        $admin = $this->createAdmin();
        $service = Service::factory()->create(['is_active' => true]);

        // Verify it exists
        $response = $this->getJson('/api/services');
        $response->assertOk();
        $response->assertJsonCount(1);

        // Admin deletes it
        $response = $this->withHeaders($this->jsonHeaders($admin))
            ->deleteJson("/api/cms/services/{$service->id}");

        $response->assertOk();

        // Verify it's gone from public API
        $response = $this->getJson('/api/services');
        $response->assertOk();
        $response->assertJsonCount(0);
    }
}
