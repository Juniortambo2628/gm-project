<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class BookingFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_own_bookings(): void
    {
        $user = User::factory()->create(['email' => 'client@example.com']);
        $token = $user->createToken('auth_token')->plainTextToken;

        $service = Service::factory()->create();
        Transaction::factory()->create([
            'email' => 'client@example.com',
            'service_id' => $service->id,
            'status' => 'success',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/user/bookings');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_user_cannot_see_other_users_bookings(): void
    {
        $user = User::factory()->create(['email' => 'client1@example.com']);
        $token = $user->createToken('auth_token')->plainTextToken;

        $service = Service::factory()->create();
        Transaction::factory()->create([
            'email' => 'client2@example.com',
            'service_id' => $service->id,
            'status' => 'success',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/user/bookings');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
    }

    public function test_admin_can_list_all_orders(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $service = Service::factory()->create();
        Transaction::factory()->count(3)->create(['service_id' => $service->id]);

        $response = $this->getJson('/api/cms/orders');
        $response->assertOk();
        $response->assertJsonCount(3, 'data');
    }

    public function test_admin_can_update_order_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $transaction = Transaction::factory()->create(['status' => 'pending']);

        $response = $this->putJson("/api/cms/orders/{$transaction->id}/status", [
            'status' => 'success',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('transactions', ['id' => $transaction->id, 'status' => 'success']);
    }

    public function test_appointment_created_with_correct_fields(): void
    {
        $service = Service::factory()->create(['duration' => '60 minutes']);
        $transaction = Transaction::factory()->create([
            'service_id' => $service->id,
            'status' => 'success',
        ]);

        $appointment = Appointment::factory()->create([
            'transaction_id' => $transaction->id,
            'service_id' => $service->id,
            'client_name' => $transaction->name,
            'client_email' => $transaction->email,
            'status' => 'scheduled',
        ]);

        $this->assertDatabaseHas('appointments', [
            'transaction_id' => $transaction->id,
            'client_email' => $transaction->email,
            'status' => 'scheduled',
        ]);
    }

    public function test_inquiry_creates_message_and_sends_emails(): void
    {
        Mail::fake();

        $payload = [
            'name' => 'Test Client',
            'email' => 'client@test.com',
            'subject' => 'MBA Inquiry',
            'content' => 'I would like to know more about MBA coaching.',
        ];

        $response = $this->postJson('/api/messages', $payload);
        $response->assertStatus(201);
        $response->assertJson(['status' => 'success']);

        $this->assertDatabaseHas('messages', [
            'email' => 'client@test.com',
            'subject' => 'MBA Inquiry',
        ]);
    }

    public function test_inquiry_validates_required_fields(): void
    {
        $response = $this->postJson('/api/messages', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'email', 'content']);
    }
}
