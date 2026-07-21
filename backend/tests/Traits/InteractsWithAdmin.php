<?php

namespace Tests\Traits;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

trait InteractsWithAdmin
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

    protected function actingAsAdmin(?User &$admin = null): User
    {
        $admin = $this->createAdmin();
        $this->actingAs($admin);

        return $admin;
    }

    protected function createAdminToken(User $admin): string
    {
        return $admin->createToken('auth_token')->plainTextToken;
    }

    protected function enableAdmin2FA(): void
    {
        Setting::set('admin_2fa_enabled', '1', 'security');
    }
}
