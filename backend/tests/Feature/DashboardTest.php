<?php

namespace Tests\Feature;

use App\Models\Message;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
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
                'previous_month_revenue',
            ],
            'revenue_series' => [
                ['month', 'year', 'total'],
            ],
            'recent_messages',
            'recent_transactions',
        ]);
    }

    public function test_dashboard_reports_current_and_previous_month_revenue(): void
    {
        Transaction::factory()->create([
            'status' => 'success',
            'amount' => 120,
            'created_at' => Carbon::now()->startOfMonth()->addDays(2),
        ]);
        Transaction::factory()->create([
            'status' => 'success',
            'amount' => 80,
            'created_at' => Carbon::now()->subMonthNoOverflow()->startOfMonth()->addDays(2),
        ]);
        // A pending transaction this month must not count toward revenue.
        Transaction::factory()->create([
            'status' => 'pending',
            'amount' => 999,
            'created_at' => Carbon::now(),
        ]);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/dashboard');

        $response->assertOk()
            ->assertJsonPath('stats.current_month_revenue', 120)
            ->assertJsonPath('stats.previous_month_revenue', 80);
    }

    public function test_revenue_series_has_six_months_ending_this_month(): void
    {
        Transaction::factory()->create([
            'status' => 'success',
            'amount' => 50,
            'created_at' => Carbon::now()->startOfMonth()->addDays(1),
        ]);

        $response = $this->withHeaders($this->jsonHeaders($this->admin))
            ->getJson('/api/cms/dashboard');

        $response->assertOk();
        $series = $response->json('revenue_series');

        $this->assertCount(6, $series);
        // Oldest first, current month last.
        $this->assertSame(Carbon::now()->format('M'), $series[5]['month']);
        $this->assertEquals(50, $series[5]['total']);
        $this->assertEquals(0, $series[0]['total']);
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
