<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\PinnedMessageServiceInterface;
use Converse\Chat\Events\MessagePinned;
use Converse\Chat\Events\MessageUnpinned;
use Converse\Chat\Http\Resources\MessageResource;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

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

        $this->pinnedMessages->pin($message, $request->user()->getAuthIdentifier());

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
