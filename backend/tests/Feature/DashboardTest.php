<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createAdmin();
    }

    public function test_admin_can_access_dashboard(): void
    {
        Message::factory()->count(3)->create();
        Transaction::factory()->count(2)->create(['status' => 'success']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/dashboard');

        $response->assertOk();
        $response->assertJsonStructure([
            'stats' => [
                'total_messages',
                'total_transactions',
                'total_revenue',
                'current_month_revenue',
            ],
            'recent_messages',
            'recent_transactions',
        ]);
    }

    public function test_dashboard_returns_correct_counts(): void
    {
        Message::factory()->count(5)->create();
        Transaction::factory()->count(3)->create(['status' => 'success', 'amount' => 10000]);
        Transaction::factory()->count(2)->create(['status' => 'pending']);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/dashboard');

        $response->assertOk();
        $response->assertJsonPath('stats.total_messages', 5);
        $response->assertJsonPath('stats.total_transactions', 3);
    }

    public function test_participant_cannot_access_dashboard(): void
    {
        $user = $this->createParticipant();

        $response = $this->withHeaders($this->jsonHeaders($user))
            ->getJson('/api/cms/dashboard');

        $response->assertForbidden();
    }
}
