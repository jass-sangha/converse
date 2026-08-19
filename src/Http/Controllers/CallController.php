<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Riwaaq\Chat\Events\CallSignal;
use Riwaaq\Chat\Models\Conversation;

class CallController extends Controller
{
    public function signal(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $data = $request->validate([
            'payload' => ['required', 'array'],
            'to_type' => ['nullable', 'string'],
            'to_id' => ['nullable', 'integer'],
        ]);

        $chatable = $request->user();

        $recipients = $conversation->activeParticipants()
            ->get()
            ->reject(fn ($participant) => $participant->chatable_type === $chatable->getMorphClass()
                && (string) $participant->chatable_id === (string) $chatable->getKey());

        // A group call's peer-to-peer mesh needs offers/answers/ICE candidates routed to one
        // specific participant, not broadcast to the whole conversation the way a "someone is
        // joining the call" announcement is — otherwise every member would try to answer an SDP
        // negotiation that was only ever meant for one of them.
        if (! empty($data['to_type']) && isset($data['to_id'])) {
            $recipients = $recipients->filter(fn ($participant) => $participant->chatable_type === $data['to_type']
                && (string) $participant->chatable_id === (string) $data['to_id']);
        }

        $recipientChannels = $recipients
            ->map(fn ($participant) => "chatable.{$participant->chatable_type}.{$participant->chatable_id}")
            ->values()
            ->all();

        broadcast(new CallSignal($conversation->id, $chatable, $data['payload'], $recipientChannels))->toOthers();

        return response()->noContent();
    }
}
