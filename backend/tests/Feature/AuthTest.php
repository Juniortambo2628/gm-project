<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        Mail::fake();

        $payload = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/register', $payload);
        $response->assertOk();
        $response->assertJsonStructure(['access_token', 'token_type', 'user']);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com', 'role' => 'participant']);
    }

    public function test_user_cannot_register_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $payload = [
            'name' => 'Test User',
            'email' => 'existing@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ];

        $response = $this->postJson('/api/register', $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_login(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['access_token', 'token_type', 'user']);
    }

    public function test_user_cannot_login_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('Password123!'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_2fa_sends_code_via_email(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('Admin123!'),
        ]);

        Setting::set('admin_2fa_enabled', '1', 'security');

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'Admin123!',
        ]);

        $response->assertStatus(200);
        $response->assertJson(['requires_2fa' => true]);
        $response->assertJsonMissing(['debug_code']);

        // Verify 2FA code was stored
        $this->assertNotNull(Setting::get('temp_2fa_code_'.$admin->id));
    }

    public function test_2fa_code_not_leaked_in_response(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('Admin123!'),
        ]);

        Setting::set('admin_2fa_enabled', '1', 'security');

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'Admin123!',
        ]);

        $response->assertStatus(200);
        $response->assertJsonMissing(['debug_code']);
        $response->assertJsonStructure(['requires_2fa', 'email_masked', 'temp_token']);
    }

    public function test_forgot_password_code_not_leaked(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'reset@example.com']);

        $response = $this->postJson('/api/forgot-password', [
            'email' => 'reset@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJsonMissing(['debug_code']);
        $response->assertJsonStructure(['message', 'temp_token']);
    }

    public function test_forgot_password_nonexistent_email_returns_same_response(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJsonMissing(['debug_code']);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout');

        $response->assertStatus(200);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_unauthenticated_user_cannot_access_user_profile(): void
    {
        $response = $this->getJson('/api/user');
        $response->assertStatus(401);
    }

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/user', [
                'name' => 'Updated Name',
                'email' => 'updated@example.com',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Name']);
    }

    public function test_user_can_change_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123!'),
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/change-password', [
                'current_password' => 'OldPassword123!',
                'new_password' => 'NewPassword456!',
                'new_password_confirmation' => 'NewPassword456!',
            ]);

        $response->assertStatus(200);
    }

    public function test_user_cannot_change_password_with_wrong_current(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123!'),
        ]);
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/change-password', [
                'current_password' => 'WrongPassword!',
                'new_password' => 'NewPassword456!',
                'new_password_confirmation' => 'NewPassword456!',
            ]);

        $response->assertStatus(422);
    }

    public function test_2fa_code_verifies_successfully(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('Admin123!'),
        ]);

        Setting::set('admin_2fa_enabled', '1', 'security');

        // Login triggers 2FA
        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'Admin123!',
        ]);

        $response->assertOk();
        $tempToken = $response->json('temp_token');

        // Get the stored code and extract the actual code value
        $storedData = json_decode(Setting::get('temp_2fa_code_'.$admin->id), true);

        // Verify with correct code
        $response = $this->postJson('/api/login/verify-2fa', [
            'temp_token' => $tempToken,
            'code' => $storedData['code'],
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['access_token', 'token_type', 'user']);
    }

    public function test_2fa_code_rejects_wrong_code(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('Admin123!'),
        ]);

        Setting::set('admin_2fa_enabled', '1', 'security');

        $response = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'Admin123!',
        ]);

        $response->assertOk();
        $tempToken = $response->json('temp_token');

        $response = $this->postJson('/api/login/verify-2fa', [
            'temp_token' => $tempToken,
            'code' => '000000',
        ]);

        $response->assertStatus(422);
    }

    public function test_verify_reset_code_with_valid_code(): void
    {
        Mail::fake();

        $user = User::factory()->create(['email' => 'reset@example.com']);

        // Request password reset
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'reset@example.com',
        ]);

        $response->assertOk();
        $tempToken = $response->json('temp_token');

        // Get the stored code and extract the actual code value
        $storedData = json_decode(Setting::get('temp_reset_code_'.$user->id), true);

        // Verify the code
        $response = $this->postJson('/api/verify-reset-code', [
            'temp_token' => $tempToken,
            'code' => $storedData['code'],
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['message', 'reset_token']);
    }

    public function test_reset_password_with_valid_token(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'reset@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        // Request reset
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'reset@example.com',
        ]);

        $tempToken = $response->json('temp_token');
        $storedData = json_decode(Setting::get('temp_reset_code_'.$user->id), true);

        // Verify code to get reset token
        $response = $this->postJson('/api/verify-reset-code', [
            'temp_token' => $tempToken,
            'code' => $storedData['code'],
        ]);

        $resetToken = $response->json('reset_token');

        // Reset password
        $response = $this->postJson('/api/reset-password', [
            'reset_token' => $resetToken,
            'password' => 'NewPassword456!',
            'password_confirmation' => 'NewPassword456!',
        ]);

        $response->assertOk();

        // Verify new password works
        $response = $this->postJson('/api/login', [
            'email' => 'reset@example.com',
            'password' => 'NewPassword456!',
        ]);

        $response->assertOk();
    }
}
