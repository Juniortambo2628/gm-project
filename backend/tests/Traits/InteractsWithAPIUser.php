<?php

namespace Tests\Traits;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

trait InteractsWithAPIUser
{
    protected function createParticipant(array $overrides = []): User
    {
        $defaults = [
            'name' => 'Test Participant',
            'email' => 'participant@example.com',
            'password' => Hash::make('Password123!'),
            'role' => 'participant',
        ];

        return User::factory()->create(array_merge($defaults, $overrides));
    }

    protected function actingAsParticipant(?User &$user = null): User
    {
        $user = $this->createParticipant();
        $this->actingAs($user);

        return $user;
    }

    protected function createParticipantToken(User $user): string
    {
        return $user->createToken('auth_token')->plainTextToken;
    }
}
