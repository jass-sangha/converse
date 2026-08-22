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
            'payload' => ['required', 'array', function ($attribute, $value, $fail) {
                $maxBytes = config('chat.calls.max_payload_bytes', 65536);

                if (strlen(json_encode($value)) > $maxBytes) {
                    $fail("The {$attribute} must not exceed {$maxBytes} bytes when serialized.");
                }
            }],
            'to_type' => ['nullable', 'string'],
            'to_id' => ['nullable', 'integer'],
        ]);

        $chatable = $request->user();

        $recipients = $conversation->activeParticipants()
            ->get()
            ->reject(fn ($participant) => $participant->chatable_type === $chatable->getMorphClass()
                && (string) $participant->chatable_id === (string) $chatable->getKey());

        // Narrows recipients to one target instead of broadcasting to the whole conversation —
        // a call's SDP offer/answer/ICE signaling is peer-to-peer, so broadcasting it would make
        // every other member try to answer a negotiation meant for someone else.
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
