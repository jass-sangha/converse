<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\PollVoteServiceInterface;
use Converse\Chat\Http\Requests\VoteOnPollRequest;
use Converse\Chat\Models\Message;
use Illuminate\Support\Facades\Gate;

class PollVoteController extends Controller
{
    public function __construct(
        protected PollVoteServiceInterface $votes,
    ) {}

    public function store(VoteOnPollRequest $request, Message $message)
    {
        Gate::authorize('vote', $message);

        $tally = $this->votes->toggle(
            $message,
            $request->user(),
            $request->validated()['option_index'],
        );

        return response()->json(['data' => $tally]);
    }
}
