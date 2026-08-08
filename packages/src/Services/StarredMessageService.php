<?php

namespace Converse\Chat\Services;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\StarredMessageServiceInterface;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\StarredMessage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class StarredMessageService implements StarredMessageServiceInterface
{
    public function star(Message $message, Model $chatable): void
    {
        StarredMessage::query()->firstOrCreate([
            'message_id' => $message->id,
            'chatable_type' => $chatable->getMorphClass(),
            'chatable_id' => $chatable->getKey(),
        ]);
    }

    public function unstar(Message $message, Model $chatable): void
    {
        Chat::whereChatable(
            StarredMessage::query()->where('message_id', $message->id),
            $chatable
        )->delete();
    }

    public function listForUser(Model $chatable, int $perPage): LengthAwarePaginator
    {
        return Chat::whereChatable(StarredMessage::query(), $chatable)
            ->with('message.attachments', 'message.reactions', 'message.conversation.participants')
            ->latest('id')
            ->paginate($perPage);
    }
}
