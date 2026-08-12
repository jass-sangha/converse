<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\EventRsvpServiceInterface;
use Converse\Chat\Http\Requests\RespondToEventRequest;
use Converse\Chat\Models\Message;
use Illuminate\Support\Facades\Gate;

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
