<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

class SettingFactory extends Factory
{
    protected $model = Setting::class;

    public function definition(): array
    {
        return [
            'key' => fake()->unique()->slug(2),
            'value' => fake()->sentence(),
            'group' => fake()->randomElement(['general', 'branding', 'about', 'communications']),
        ];
    }

    public function security(): static
    {
        return $this->state(fn () => ['group' => 'security']);
    }
}
