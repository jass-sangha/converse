<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\MessageReceiptServiceInterface;
use Converse\Chat\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class MessageReceiptController extends Controller
{
    public function __construct(
        protected MessageReceiptServiceInterface $receipts,
    ) {}

    public function markDelivered(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->receipts->markDelivered($conversation, $request->user()->getAuthIdentifier());

        return response()->noContent();
    }

    public function markRead(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $upToMessageId = $request->integer('up_to_message_id') ?: null;

        $this->receipts->markRead($conversation, $request->user()->getAuthIdentifier(), $upToMessageId);

        return response()->noContent();
    }
}
