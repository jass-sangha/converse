<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use Riwaaq\Chat\Contracts\EventRsvpServiceInterface;
use Riwaaq\Chat\Http\Requests\RespondToEventRequest;
use Riwaaq\Chat\Models\Message;

class EventRsvpController extends Controller
{
    public function __construct(
        protected EventRsvpServiceInterface $rsvps,
    ) {}

    public function store(RespondToEventRequest $request, Message $message)
    {
        Gate::authorize('rsvp', $message);

        $tally = $this->rsvps->respond(
            $message,
            $request->user(),
            $request->validated()['status'] ?? null,
        );

        return response()->json(['data' => $tally]);
    }
}
