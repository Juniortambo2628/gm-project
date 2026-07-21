<?php

namespace Tests;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Hash;

abstract class TestCase extends BaseTestCase
{
    protected function createAdmin(array $overrides = []): User
    {
        $defaults = [
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('Admin123!'),
            'role' => 'admin',
        ];

        return User::factory()->create(array_merge($defaults, $overrides));
    }

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

    protected function actingAsAdmin(): User
    {
        $admin = $this->createAdmin();
        $this->actingAs($admin);

        return $admin;
    }

    protected function actingAsParticipant(): User
    {
        $user = $this->createParticipant();
        $this->actingAs($user);

        return $user;
    }

    protected function createService(array $overrides = []): Service
    {
        $defaults = [
            'name' => 'MBA Admissions Consulting',
            'type' => 'mba',
            'price' => 50000,
            'currency' => 'USD',
            'duration' => '6 weeks',
            'features' => ['Essay Review', 'Interview Prep'],
            'description' => 'Full admissions consulting package',
            'is_active' => true,
        ];

        return Service::factory()->create(array_merge($defaults, $overrides));
    }

    protected function jsonHeaders(User $user): array
    {
        $token = $user->createToken('test-token')->plainTextToken;

        return [
            'Authorization' => "Bearer {$token}",
            'Accept' => 'application/json',
            'Content-Type' => 'application/json',
        ];
    }
}
