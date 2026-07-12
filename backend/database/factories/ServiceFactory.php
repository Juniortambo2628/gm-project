<?php

namespace Database\Factories;

use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    protected $model = Service::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->sentence(3),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 0, 500),
            'currency' => 'USD',
            'type' => fake()->randomElement(['mba', 'consulting']),
            'duration' => fake()->randomElement(['30 minutes', '60 minutes', '90 minutes']),
            'is_active' => true,
        ];
    }

    public function mba(): static
    {
        return $this->state(fn () => ['type' => 'mba', 'name' => 'MBA Admissions Coaching']);
    }

    public function consulting(): static
    {
        return $this->state(fn () => ['type' => 'consulting', 'name' => 'Consulting Interview Prep']);
    }

    public function free(): static
    {
        return $this->state(fn () => ['price' => 0, 'name' => 'Discovery Call']);
    }
}
