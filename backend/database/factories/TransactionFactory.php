<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'amount' => fake()->randomFloat(2, 10, 500),
            'currency' => 'USD',
            'service_id' => Service::factory(),
            'paystack_ref' => 'psk_'.fake()->unique()->numerify('##########'),
            'status' => 'success',
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending']);
    }

    public function failed(): static
    {
        return $this->state(fn () => ['status' => 'failed']);
    }
}
