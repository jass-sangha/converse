<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Riwaaq\Chat\Contracts\MessageReactionServiceInterface;
use Riwaaq\Chat\Http\Requests\ReactToMessageRequest;
use Riwaaq\Chat\Models\Message;

class MessageReactionController extends Controller
{
    public function __construct(
        protected MessageReactionServiceInterface $reactions,
    ) {}

    public function store(ReactToMessageRequest $request, Message $message)
    {
        Gate::authorize('react', $message);

        $reactions = $this->reactions->toggle(
            $message,
            $request->user(),
            $request->validated()['emoji'],
        );

        return response()->json(['data' => $reactions]);
    }

    public function destroy(Request $request, Message $message)
    {
        Gate::authorize('react', $message);

        $reactions = $this->reactions->toggle($message, $request->user(), null);

        return response()->json(['data' => $reactions]);
    }
}
