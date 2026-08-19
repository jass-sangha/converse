<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Riwaaq\Chat\Contracts\ConversationServiceInterface;

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
