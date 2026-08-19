<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Riwaaq\Chat\Contracts\StarredMessageServiceInterface;
use Riwaaq\Chat\Http\Resources\MessageResource;
use Riwaaq\Chat\Models\Message;

class StarredMessageController extends Controller
{
    public function __construct(
        protected StarredMessageServiceInterface $starred,
    ) {}

    public function index(Request $request)
    {
        $perPage = (int) config('chat.pagination.messages_per_page', 50);
        $conversationId = $request->integer('conversation_id') ?: null;

        $starred = $this->starred->listForUser($request->user(), $perPage, $conversationId);

        return MessageResource::collection($starred->through(fn ($starredMessage) => $starredMessage->message));
    }

    public function store(Request $request, Message $message)
    {
        Gate::authorize('star', $message);

        $this->starred->star($message, $request->user());

        return response()->noContent();
    }

    public function destroy(Request $request, Message $message)
    {
        Gate::authorize('star', $message);

        $this->starred->unstar($message, $request->user());

        return response()->noContent();
    }
}
