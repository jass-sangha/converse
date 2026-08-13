<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Events\CallSignal;
use Converse\Chat\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CallController extends Controller
{
    public function signal(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $data = $request->validate([
            'payload' => ['required', 'array'],
        ]);

        $chatable = $request->user();

        $recipientChannels = $conversation->activeParticipants()
            ->get()
            ->reject(fn ($participant) => $participant->chatable_type === $chatable->getMorphClass()
                && (string) $participant->chatable_id === (string) $chatable->getKey())
            ->map(fn ($participant) => "chatable.{$participant->chatable_type}.{$participant->chatable_id}")
            ->values()
            ->all();

        broadcast(new CallSignal($conversation->id, $chatable, $data['payload'], $recipientChannels))->toOthers();

        return response()->noContent();
    }
}
