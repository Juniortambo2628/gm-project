<?php

namespace Tests\Feature;

use App\Models\Faq;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaqCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_create_faq(): void
    {
        $payload = [
            'question' => 'How do I apply?',
            'answer' => 'You can apply through our website.',
            'category' => 'admissions',
        ];

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/faqs', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('faqs', ['question' => 'How do I apply?']);
    }

    public function test_admin_can_update_faq(): void
    {
        $faq = Faq::factory()->create(['question' => 'Old Question']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->putJson("/api/cms/faqs/{$faq->id}", [
                'question' => 'Updated Question',
                'answer' => $faq->answer,
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('faqs', ['id' => $faq->id, 'question' => 'Updated Question']);
    }

    public function test_admin_can_delete_faq(): void
    {
        $faq = Faq::factory()->create();

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->deleteJson("/api/cms/faqs/{$faq->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('faqs', ['id' => $faq->id]);
    }

    public function test_participant_cannot_create_faq(): void
    {
        $user = $this->createParticipant();

        $response = $this->withHeaders($this->jsonHeaders($user))
            ->postJson('/api/cms/faqs', [
                'question' => 'Unauthorized',
                'answer' => 'Answer',
            ]);

        $response->assertForbidden();
    }

    public function test_faq_validation_requires_question_and_answer(): void
    {
        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->postJson('/api/cms/faqs', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['question', 'answer']);
    }
}
