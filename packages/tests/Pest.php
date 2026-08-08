<?php

use Converse\Chat\Tests\TestCase;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(TestCase::class, RefreshDatabase::class)->in('Feature', 'Unit');

/**
 * The {type, id} shape the polymorphic chat API expects wherever a participant
 * is referenced (StoreConversationRequest, AddParticipantsRequest, BlockUserRequest).
 */
function chatableRef(Model $model): array
{
    return ['type' => $model->getMorphClass(), 'id' => $model->getKey()];
}

/**
 * @param  iterable<Model>  $models
 */
function chatableRefs(iterable $models): array
{
    return collect($models)->map(fn (Model $model) => chatableRef($model))->all();
}
