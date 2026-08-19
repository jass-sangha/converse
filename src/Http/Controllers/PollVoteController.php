<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use Riwaaq\Chat\Contracts\PollVoteServiceInterface;
use Riwaaq\Chat\Http\Requests\VoteOnPollRequest;
use Riwaaq\Chat\Models\Message;

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
