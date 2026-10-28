<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Message;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTimelineAndAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_client_directory_combines_activity_by_email(): void
    {
        $email = 'person@example.com';
        $user = User::factory()->create(['name' => 'Pat Client', 'email' => $email]);
        Message::factory()->create(['name' => 'Pat', 'email' => $email]);
        Transaction::factory()->create(['name' => 'Pat', 'email' => $email]);
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->getJson('/api/cms/clients?q=person@example.com');

        $response->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.email', $email)
            ->assertJsonPath('data.0.name', 'Pat Client')
            ->assertJsonPath('data.0.activity_count', 3)
            ->assertJsonPath('data.0.source_type', 'account')
            ->assertJsonPath('data.0.source_id', $user->id);
    }

    public function test_client_record_shows_payment_and_inquiry_history(): void
    {
        $user = User::factory()->create(['email' => 'person@example.com']);
        Transaction::factory()->create(['email' => 'person@example.com']);
        Message::factory()->create(['email' => 'person@example.com']);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->getJson("/api/cms/clients/account/{$user->id}")
            ->assertOk()
            ->assertJsonPath('client.email', 'person@example.com')
            ->assertJsonCount(1, 'payments')
            ->assertJsonCount(1, 'inquiries');
    }

    public function test_successful_admin_mutations_create_audit_events(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/api/cms/users', [
            'name' => 'New Participant',
            'email' => 'new-participant@example.com',
            'password' => 'Password123!',
            'role' => 'participant',
        ])->assertCreated();

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'POST api/cms/users',
            'status_code' => 201,
        ]);
        $this->assertSame(1, AuditLog::count());
    }
}
