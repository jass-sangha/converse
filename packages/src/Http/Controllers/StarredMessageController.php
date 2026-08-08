<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\StarredMessageServiceInterface;
use Converse\Chat\Http\Resources\MessageResource;
use Converse\Chat\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class StarredMessageController extends Controller
{
    public function __construct(
        protected StarredMessageServiceInterface $starred,
    ) {}

    public function index(Request $request)
    {
        $perPage = (int) config('chat.pagination.messages_per_page', 50);

        $starred = $this->starred->listForUser($request->user(), $perPage);

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
