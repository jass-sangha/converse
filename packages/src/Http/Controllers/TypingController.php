<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Events\UserStoppedTyping;
use Converse\Chat\Events\UserTyping;
use Converse\Chat\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class TypingController extends Controller
{
    public function update(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $data = $request->validate([
            'state' => ['required', Rule::in(['start', 'stop'])],
        ]);

        $userId = $request->user()->getAuthIdentifier();

        if ($data['state'] === 'start') {
            broadcast(new UserTyping($conversation->id, $userId))->toOthers();
        } else {
            broadcast(new UserStoppedTyping($conversation->id, $userId))->toOthers();
        }

        return response()->noContent();
    }
}
