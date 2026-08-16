<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\ConversationServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    public function __construct(
        protected ConversationServiceInterface $conversations,
    ) {}

    public function muteAll(Request $request)
    {
        $data = $request->validate([
            'scope' => ['required', Rule::in(['private', 'group', 'both'])],
            'muted_until' => ['nullable', 'date'],
        ]);

        $type = $data['scope'] === 'both' ? null : $data['scope'];

        $this->conversations->muteAllOfType($request->user(), $type, $data['muted_until'] ?? null);

        return response()->noContent();
    }
}
