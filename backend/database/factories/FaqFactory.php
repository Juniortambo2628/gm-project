<?php

namespace Database\Factories;

use App\Models\Faq;
use Illuminate\Database\Eloquent\Factories\Factory;

class FaqFactory extends Factory
{
    protected $model = Faq::class;

    public function definition(): array
    {
        return [
            'question' => fake()->sentence(),
            'answer' => fake()->paragraph(),
            'category' => fake()->randomElement(['MBA', 'Consulting', 'General']),
            'order' => fake()->numberBetween(0, 100),
        ];
    }
}
