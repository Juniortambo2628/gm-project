<?php

namespace Database\Factories;

use App\Models\MailTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

class MailTemplateFactory extends Factory
{
    protected $model = MailTemplate::class;

    public function definition(): array
    {
        $key = fake()->unique()->slug(2);
        return [
            'key' => $key,
            'name' => fake()->sentence(3),
            'subject' => fake()->sentence(),
            'body' => '<p>Hello {name},</p><p>' . fake()->paragraph() . '</p>',
            'variables' => ['{name}'],
            'description' => fake()->sentence(),
            'from_address' => fake()->safeEmail(),
            'from_name' => fake()->company(),
            'is_active' => true,
        ];
    }
}
