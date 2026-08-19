<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\StarredMessageServiceInterface;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Models\StarredMessage;

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

    public function listForUser(Model $chatable, int $perPage, ?int $conversationId = null): LengthAwarePaginator
    {
        $query = Chat::whereChatable(StarredMessage::query(), $chatable)
            ->with('message.attachments', 'message.reactions', 'message.conversation.participants')
            ->latest('id');

        if ($conversationId !== null) {
            $query->whereHas('message', fn ($q) => $q->where('conversation_id', $conversationId));
        }

        return $query->paginate($perPage);
    }
}
