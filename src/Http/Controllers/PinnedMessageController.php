<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Riwaaq\Chat\Contracts\PinnedMessageServiceInterface;
use Riwaaq\Chat\Events\MessagePinned;
use Riwaaq\Chat\Events\MessageUnpinned;
use Riwaaq\Chat\Http\Resources\MessageResource;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;

class PinnedMessageController extends Controller
{
    public function __construct(
        protected PinnedMessageServiceInterface $pinnedMessages,
    ) {}

    public function index(Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $pinned = $this->pinnedMessages->listForConversation($conversation);

        return MessageResource::collection($pinned->map(fn ($pinnedMessage) => $pinnedMessage->message));
    }

    public function store(Request $request, Message $message)
    {
        Gate::authorize('pin', $message);

        $this->pinnedMessages->pin($message, $request->user());

        broadcast(new MessagePinned($message))->toOthers();

        return response()->noContent();
    }

    public function destroy(Message $message)
    {
        Gate::authorize('pin', $message);

        $this->pinnedMessages->unpin($message);

        broadcast(new MessageUnpinned($message->id, $message->conversation_id))->toOthers();

        return response()->noContent();
    }
}
