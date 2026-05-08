<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Gathoni Mwai',
            'email' => 'admin@gathonimwai.com',
            'password' => Hash::make('password'), // Change this in production
            'role' => 'admin'
        ]);

        // Create a Test Client User
        User::create([
            'name' => 'John Doe',
            'email' => 'client@example.com',
            'password' => Hash::make('password'),
            'role' => 'user'
        ]);
    }
}
