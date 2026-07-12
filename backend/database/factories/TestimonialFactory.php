<?php

namespace Database\Factories;

use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Factories\Factory;

class TestimonialFactory extends Factory
{
    protected $model = Testimonial::class;

    public function definition(): array
    {
        return [
            'client_name' => fake()->name(),
            'client_role' => fake()->jobTitle(),
            'content' => fake()->paragraph(),
            'outcome' => fake()->sentence(),
            'tag' => fake()->randomElement(['MBA Admissions', 'Consulting Prep']),
            'is_active' => true,
        ];
    }
}
