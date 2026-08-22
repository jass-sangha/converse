<?php

use Illuminate\Database\UniqueConstraintViolationException;
use Riwaaq\Chat\Contracts\ConversationRepositoryInterface;
use Riwaaq\Chat\Tests\Fixtures\User;

function pairKeyUser(): User
{
    return User::query()->create([
        'name' => fake()->name(),
        'email' => fake()->unique()->safeEmail(),
        'password' => bcrypt('secret'),
    ]);
}

it('rejects a second private conversation for the same pair at the database level', function () {
    // findOrCreatePrivate()'s own "does one already exist" check is app-level and racy under
    // concurrent requests — this proves the private_pair_key unique index is a real backstop
    // that the database itself enforces, independent of that check ever running.
    $alice = pairKeyUser();
    $bob = pairKeyUser();

    $repository = app(ConversationRepositoryInterface::class);

    $repository->create([], collect([$alice, $bob]), $alice);

    expect(fn () => $repository->create([], collect([$bob, $alice]), $bob))
        ->toThrow(UniqueConstraintViolationException::class);
});

it('lets private conversations for different pairs coexist', function () {
    $alice = pairKeyUser();
    $bob = pairKeyUser();
    $carol = pairKeyUser();

    $repository = app(ConversationRepositoryInterface::class);

    $ab = $repository->create([], collect([$alice, $bob]), $alice);
    $ac = $repository->create([], collect([$alice, $carol]), $alice);

    expect($ab->id)->not->toBe($ac->id);
});
