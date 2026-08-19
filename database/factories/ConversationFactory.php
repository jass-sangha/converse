<?php

namespace Riwaaq\Chat\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Riwaaq\Chat\Enums\ConversationType;
use Riwaaq\Chat\Models\Conversation;

class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    public function definition(): array
    {
        return [
            'type' => ConversationType::Private,
            'name' => null,
            'last_activity_at' => now(),
        ];
    }

    public function group(): static
    {
        return $this->state(fn () => [
            'type' => ConversationType::Group,
            'name' => $this->faker->words(2, true),
        ]);
    }
}
