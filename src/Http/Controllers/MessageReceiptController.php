<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Riwaaq\Chat\Contracts\MessageReceiptServiceInterface;
use Riwaaq\Chat\Models\Conversation;

class MessageReceiptController extends Controller
{
    public function __construct(
        protected MessageReceiptServiceInterface $receipts,
    ) {}

    public function markDelivered(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->receipts->markDelivered($conversation, $request->user());

        return response()->noContent();
    }

    public function markRead(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $upToMessageId = $request->integer('up_to_message_id') ?: null;

        $this->receipts->markRead($conversation, $request->user(), $upToMessageId);

        return response()->noContent();
    }
}
