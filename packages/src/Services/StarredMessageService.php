<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\StarredMessageServiceInterface;
use Converse\Chat\Models\Message;
use Converse\Chat\Models\StarredMessage;
use Illuminate\Pagination\LengthAwarePaginator;

class StarredMessageService implements StarredMessageServiceInterface
{
    public function star(Message $message, int $userId): void
    {
        StarredMessage::query()->firstOrCreate([
            'message_id' => $message->id,
            'user_id' => $userId,
        ]);
    }

    public function unstar(Message $message, int $userId): void
    {
        StarredMessage::query()
            ->where('message_id', $message->id)
            ->where('user_id', $userId)
            ->delete();
    }

    public function listForUser(int $userId, int $perPage): LengthAwarePaginator
    {
        return StarredMessage::query()
            ->where('user_id', $userId)
            ->with('message.attachments', 'message.reactions', 'message.conversation.participants')
            ->latest('id')
            ->paginate($perPage);
    }
}
