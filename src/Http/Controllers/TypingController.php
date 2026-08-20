<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Riwaaq\Chat\Contracts\UserSettingsServiceInterface;
use Riwaaq\Chat\Events\UserStoppedTyping;
use Riwaaq\Chat\Events\UserTyping;
use Riwaaq\Chat\Models\Conversation;

class TypingController extends Controller
{
    public function __construct(
        protected UserSettingsServiceInterface $settings,
    ) {}

    public function update(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $data = $request->validate([
            'state' => ['required', Rule::in(['start', 'stop'])],
        ]);

        $chatable = $request->user();

        if (! $this->settings->allowsTypingIndicator($chatable)) {
            return response()->noContent();
        }

        if ($data['state'] === 'start') {
            broadcast(new UserTyping($conversation->id, $chatable))->toOthers();
        } else {
            broadcast(new UserStoppedTyping($conversation->id, $chatable))->toOthers();
        }

        return response()->noContent();
    }
}
